# ระบบ Auto-Cleanup (การลบข้อมูลอัตโนมัติ)

> อัพเดตล่าสุด: 2026-03-19

---

## 1. ภาพรวม

ระบบ RBMS-POS มีข้อมูลชั่วคราวหลายประเภท (tokens, sessions, notifications) ที่หมดประโยชน์เมื่อเวลาผ่านไป ระบบ Auto-Cleanup ทำหน้าที่ **ลบข้อมูลเหล่านี้อัตโนมัติ** เพื่อ:

- ป้องกัน database โตไม่หยุด
- รักษา performance ของ query
- ไม่ต้องให้ admin มานั่งลบด้วยมือ

> **กฎสำคัญ:** Cleanup เฉพาะข้อมูลชั่วคราวที่ไม่มีค่าทาง business เท่านั้น — **ห้ามลบ transaction data** (Orders, Payments, Cashier Sessions, Reservations) เพราะต้องใช้ทำ Report และ Audit

---

## 2. สถาปัตยกรรม

### 2.1 Background Service

ใช้ **ASP.NET Core IHostedService** (`BackgroundService`) รันอยู่ใน Backend process ตลอดเวลา — ไม่ต้องตั้งค่า ไม่ต้องกดปุ่ม เริ่มทำงานอัตโนมัติเมื่อ `dotnet run`

```
Backend เริ่มทำงาน (dotnet run)
    │
    ├── CleanupBackgroundService เริ่มรัน
    │       │
    │       ├── ทุก 6 ชั่วโมง → ลบ expired tokens + sessions
    │       │
    │       └── ทุกวันเวลา 03:00 → ลบ notifications เก่า
    │
    └── (Backend ทำงานปกติ — API, SignalR, etc.)
```

### 2.2 ทำไมเวลา 03:00

- เวลาที่ร้านปิดแล้ว ไม่มี traffic → ลด load ของ database
- ถ้าร้านเปิด 24 ชม. → ยังคง low traffic ช่วงตี 3

### 2.3 Implementation Pattern

```csharp
// RBMS.POS.WebAPI/Services/CleanupBackgroundService.cs
public class CleanupBackgroundService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;

            // ── ทุก 6 ชั่วโมง: ลบ tokens + sessions ──
            await CleanExpiredRefreshTokensAsync(ct);
            await CleanExpiredCustomerSessionsAsync(ct);

            // ── ถ้าเป็นเวลา 03:00: ลบ notifications ──
            if (now.Hour == 3 && now.Minute < 10)
            {
                await CleanOldNotificationsAsync(ct);
            }

            await Task.Delay(TimeSpan.FromHours(6), ct);
        }
    }
}
```

> **หมายเหตุ:** ใช้ `IServiceScopeFactory` สร้าง scope ใหม่ทุกครั้งที่ cleanup เพราะ DbContext เป็น scoped service

---

## 3. ตารางที่ต้อง Cleanup

### 3.1 Scheduled Cleanup (Background Service)

| # | ตาราง | Retention | ความถี่ | เงื่อนไข | Hard/Soft Delete |
|---|-------|-----------|---------|---------|-----------------|
| 1 | `TbRefreshTokens` | หมดอายุทันที | ทุก 6 ชม. | `ExpiresAt < now` OR `IsRevoked = true` | Hard delete |
| 2 | `TbCustomerSession` | 24 ชม. หลังหมดอายุ | ทุก 6 ชม. | `IsActive = false` AND `ExpiresAt < now - 24hr` | Hard delete |
| 3 | `TbNotification` + `TbNotificationRead` | 7 วัน | ทุกวัน 03:00 | `CreatedAt < now - 7 วัน` | Hard delete (cascade) |

**รายละเอียด:**

#### 1) TbRefreshTokens

- **สถานะ:** สร้างแล้ว
- **ทำไมต้องลบ:** Token หมดอายุแล้วใช้ไม่ได้ + token ที่ถูก revoke (logout) ไม่มีประโยชน์
- **Query:** `DELETE FROM TbRefreshTokens WHERE ExpiresAt < @now OR IsRevoked = 1`
- **ผลกระทบ:** ไม่มี — token หมดอายุแล้วระบบไม่ใช้

#### 2) TbCustomerSession

- **สถานะ:** ในแผน (REQ-self-order-system §12.1)
- **ทำไมต้องลบ:** Session ลูกค้า QR Panel เป็นข้อมูลชั่วคราวมาก — หมดอายุเมื่อปิดโต๊ะ หรือ JWT expire
- **Query:** `DELETE FROM TbCustomerSession WHERE IsActive = 0 AND ExpiresAt < @now - 24hr`
- **ทำไม 24 ชม.:** เก็บไว้ 24 ชม. หลังหมดอายุเพื่อ debug/audit ถ้ามีปัญหา
- **ผลกระทบ:** ไม่มี — session inactive แล้ว ลูกค้าต้องสแกน QR ใหม่

#### 3) TbNotification + TbNotificationRead

- **สถานะ:** ในแผน (REQ-noti-system §5, §6)
- **ทำไมต้องลบ:** Notification เก่าไม่มีประโยชน์ — ข้อมูลจริงอยู่ใน Order/Payment/Table
- **Query:** `DELETE FROM TbNotificationRead WHERE NotificationId IN (SELECT NotificationId FROM TbNotification WHERE CreatedAt < @now - 7d)` → `DELETE FROM TbNotification WHERE CreatedAt < @now - 7d`
- **ลำดับ:** ลบ `TbNotificationRead` ก่อน (FK) → แล้วลบ `TbNotification`
- **ผลกระทบ:** Drawer ของ staff จะว่างขึ้น — ไม่กระทบการทำงาน

### 3.2 Event-driven Cleanup (ไม่ใช่ scheduled)

| # | ตาราง | เมื่อไหร่ | Trigger | Hard/Soft Delete |
|---|-------|----------|---------|-----------------|
| 4 | `TbTableLink` | เมื่อปิดโต๊ะ | Table Service: `CloseTableAsync()` | Hard delete |

#### 4) TbTableLink

- **สถานะ:** ในแผน (REQ-table-system §10.3)
- **ทำไมต้องลบ:** Link ระหว่างโต๊ะใช้แค่ระหว่างเปิดโต๊ะ — เมื่อปิดโต๊ะ link หมดความหมาย
- **Trigger:** เมื่อ `Table status → CLEANING` (ชำระเงินเสร็จ) → ลบ TbTableLink ที่เกี่ยวข้องทันที
- **ไม่ใช่ scheduled:** ลบทันทีตอน event เกิดขึ้น ไม่ต้องรอ Background Service

---

## 4. ตารางที่ห้ามลบ

> **กฎเหล็ก:** ข้อมูลที่ต้องใช้ทำ Report, Audit, หรือ Accounting **ห้ามลบ** — ใช้ Soft delete (DeleteFlag) ตามปกติ

| ตาราง | เหตุผลที่ห้ามลบ |
|-------|---------------|
| `TbOrder` + `TbOrderItem` + `TbOrderItemOption` | Report ยอดขาย, เมนูยอดนิยม, สถิติออเดอร์ |
| `TbOrderBill` + `TbOrderDiscount` | Report รายได้, ส่วนลด, margin |
| `TbPayment` | ประวัติการเงิน — audit/accounting |
| `TbCashierSession` + `TbCashDrawerTransaction` | ประวัติกะ — audit ยอดเงินสด, variance |
| `TbReservation` | สถิติการจอง, no-show rate |
| `TbFile` | รูปเมนู, โปรไฟล์, logo — ยังใช้งานอยู่ |
| ตาราง Master Data ทั้งหมด | Config/ข้อมูลหลักของระบบ |

> **อนาคต:** ถ้า transaction data โตมาก → ทำ **Archive** (ย้ายข้อมูลเก่าไปตารางแยก หรือ export เป็น report สรุป) แทนการลบ

---

## 5. Logging & Monitoring

- ทุก cleanup operation ต้อง **log** จำนวน records ที่ลบ:
  ```
  [2026-03-19 03:00:05] Cleanup: Deleted 142 expired notifications
  [2026-03-19 03:00:05] Cleanup: Deleted 38 notification reads
  [2026-03-19 09:00:02] Cleanup: Deleted 5 expired refresh tokens
  [2026-03-19 09:00:02] Cleanup: Deleted 12 expired customer sessions
  ```
- ใช้ **structured logging** (`_logger.LogInformation("Cleanup: Deleted {Count} expired {Table}", count, tableName)`)
- ถ้า cleanup fail → **log error** แต่ **ไม่หยุด Backend** — retry รอบถัดไป

---

## 6. สรุปไฟล์ที่ต้องสร้าง

| ไฟล์ | หมายเหตุ |
|------|----------|
| `RBMS.POS.WebAPI/Services/CleanupBackgroundService.cs` | IHostedService หลัก — จัดการทุก scheduled cleanup |
| `Program.cs` | Register: `builder.Services.AddHostedService<CleanupBackgroundService>()` |

> **หมายเหตุ:** TbTableLink cleanup อยู่ใน `TableService.CloseTableAsync()` ไม่ใช่ Background Service

---

## 7. จุดเชื่อมต่อเอกสารอื่น

| เอกสาร | Section | เกี่ยวข้องกับ |
|--------|---------|-------------|
| [REQ-noti-system](../requirements/REQ-noti-system.md) | §5 Persistence & Cleanup | TbNotification + TbNotificationRead (7 วัน) |
| [REQ-self-order-system](../requirements/REQ-self-order-system.md) | §12.1 TbCustomerSession | TbCustomerSession (24 ชม. หลังหมดอายุ) |
| [REQ-table-system](../requirements/REQ-table-system.md) | §10.3 TbTableLink | TbTableLink (ลบเมื่อปิดโต๊ะ) |
| [database-api-reference](database-api-reference.md) | TbRefreshTokens | TbRefreshTokens (หมดอายุ) |
