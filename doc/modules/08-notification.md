# Module 8: Notification (ระบบแจ้งเตือน Real-time)

> Cross-Cutting Module — รับ event จากทุก Module แล้วกระจายไปยังพนักงานที่เกี่ยวข้องแบบ Real-time

---

## 1. Module นี้คืออะไร

ระบบแจ้งเตือนพนักงานในร้านแบบเรียลไทม์ ทำงานคู่กับเทคโนโลยี **SignalR** (WebSocket) เพื่อส่งข้อมูลจากเซิร์ฟเวอร์ไปยังหน้าจอของพนักงานทันทีที่มีเหตุการณ์เกิดขึ้น โดยไม่ต้องให้พนักงานคอยกด Refresh หน้าจอ

ระบบมี **2 Hub** แยกหน้าที่กัน:

| Hub | หน้าที่ |
| --- | --- |
| **OrderHub** (`/hubs/order`) | broadcast event ของ Order, Table, Kitchen ไปยังกลุ่มที่ Client เลือก subscribe |
| **NotificationHub** (`/hubs/notification`) | แจ้งเตือนแบบ Toast + Drawer ไปยังกลุ่มผู้ใช้ตาม permission อัตโนมัติ |

ข้อมูลแจ้งเตือนทั้งหมดถูกบันทึกใน `TbNotification` เพื่อให้ผู้ใช้ดูย้อนหลังได้ และมีระบบ Mark Read / Clear แยกต่อผู้ใช้ผ่าน `TbNotificationRead`

---

## 2. ช่วยธุรกิจร้านอาหารในเรื่องใด

| ปัญหาแบบดั้งเดิม | สิ่งที่ระบบนี้แก้ |
| --- | --- |
| ครัวทำอาหารเสร็จ → ตะโกนเรียกพนักงาน → เสียงดัง / พลาดได้ | SignalR Push แจ้งทันที + Toast บนหน้าจอพนักงานเสิร์ฟ |
| ลูกค้าโบกมือเรียกพนักงาน → พนักงานไม่เห็น / รออื่น | ลูกค้ากด "เรียกพนักงาน" ใน Mobile Web → Toast ดังที่หน้าจอ Floor |
| ลูกค้าอัพโหลดสลิปแล้ว → แคชเชียร์ไม่รู้ → รอนาน | SignalR แจ้งแคชเชียร์ทันทีพร้อม Badge บน Bell icon |
| ครัวอาหารดูออเดอร์ของครัวเครื่องดื่ม → งานปนกัน | กลุ่มแยกตามครัว — แต่ละสถานีเห็นเฉพาะของตัวเอง |
| Manager อยากรู้ว่าร้านกำลังเป็นยังไง → ต้องเดินถาม | Manager กลุ่มได้ทุก event — เห็นภาพรวมจากหน้าจอเดียว |
| Polling ทุก 5 วินาที → กิน bandwidth + Server แต่ delay 5 วินาที | SignalR WebSocket — เปิด connection เดียว ตลอดทั้งวัน |
| แจ้งเตือนหายหากปิด tab | บันทึกใน DB → เปิดมาดูย้อนหลังได้ + Badge unread count |

**คุณค่าทางธุรกิจ**: ลดเวลาในการสื่อสารระหว่างทีม + เพิ่มประสิทธิภาพการให้บริการ + ลดข้อผิดพลาดจากการลืม + รองรับร้านขนาดใหญ่ที่ทีมงานแยกพื้นที่

---

## 3. Business Logic หลัก

### 3.1 OrderHub vs NotificationHub — ต่างกันยังไง

| ลักษณะ | OrderHub | NotificationHub |
| --- | --- | --- |
| **เป้าหมาย** | sync ข้อมูล state ของ Order/Table/Kitchen | แสดง Toast + เก็บประวัติแจ้งเตือน |
| **การ join group** | Client เลือกเอง (JoinGroup / LeaveGroup) | Auto-join ตอน connect ตาม permission |
| **เก็บใน DB ไหม** | ไม่เก็บ | เก็บใน TbNotification (cursor pagination) |
| **Frontend ใช้ทำ** | อัพเดต Signal ของ component (เช่น รายการ Order, สถานะโต๊ะ) | Toast + Drawer + Badge unread count |
| **ตัวอย่าง Event** | `ItemStatusChanged`, `TableStatusChanged` | `NEW_ORDER`, `ORDER_READY`, `CALL_WAITER` |

> สรุป: **OrderHub** = "ข้อมูลเปลี่ยน อัพเดต UI ทันที", **NotificationHub** = "แจ้งให้คนรู้ พร้อมเก็บประวัติ"

### 3.2 OrderHub Groups (Client เลือก subscribe)

| Group | ผู้ใช้ที่ join | Event ที่รับ |
| --- | --- | --- |
| `kitchen` | KDS ทุกสถานี (filter by CategoryType ฝั่ง client) | NewOrderItems, ItemStatusChanged, ItemCancelled |
| `floor` | พนักงานหน้าร้าน + แคชเชียร์ + Manager | OrderUpdated, TableStatusChanged, NewOrderItems, ItemStatusChanged, SlipUploaded, PaymentCompleted |
| `table_{tableId}` | Mobile Web ลูกค้า (auto-join ตอน QR auth) | NewOrderItems, ItemStatusChanged, RefreshOrders, SlipUploaded, PaymentCompleted, BillClaimed, BillReleased, BillVoided |

### 3.3 NotificationHub Groups (Auto-join จาก Permission)

ระบบประเมินสิทธิ์ของผู้ใช้ตอน connect แล้ว auto-join group ตามเกณฑ์ (เรียงตามลำดับ):

| Group | เงื่อนไข Auto-Join | ใช้ทำอะไร |
| --- | --- | --- |
| `Kitchen` | มี `kitchen-food.read` **หรือ** `kitchen-beverage.read` **หรือ** `kitchen-dessert.read` | รับแจ้งเตือนของครัว |
| `Floor` | มี `order-manage.read` | รับแจ้งเตือนเสิร์ฟอาหาร, ลูกค้าเรียก |
| `Cashier` | มี `payment-manage.read` | รับแจ้งเตือนขอบิล, สลิปอัพโหลด |
| `Manager` | (เพิ่มเติม) | รับทุกแจ้งเตือน |

**Logic ของ Manager group (ซับซ้อนกว่าที่คิด):**

```
if (join ครบ 3 groups [Kitchen+Floor+Cashier]) OR (permissions.Count > 15):
    → join "Manager" + บังคับเข้าทุก 4 groups (Kitchen + Floor + Cashier + Manager)

else if (permissions.Count > 10) and (ยังไม่ได้ join Manager):
    → join "Manager" group เพิ่มเติม (รับ event ของ Manager ด้วย แต่ไม่บังคับเข้า 4 groups)
```

> **สรุป**: Manager ไม่ใช่แค่ "มี permission > 10" — ระบบมี 2 เส้นทาง: (1) มีบทบาทครบ 3 ฝ่าย ได้ Manager auto, (2) มี permission > 10 จะได้ Manager เพิ่ม (แต่ไม่ได้บังคับเข้าทุก group)

### 3.4 Event Types (ใน TbNotification)

> **ที่บันทึกใน DB** ผ่าน `NotificationBroadcaster.SendAndBroadcastAsync()` (ส่ง SignalR + บันทึก TbNotification):

| Event Type | TargetGroup | ใครส่ง | ความหมาย |
| --- | --- | --- | --- |
| `NEW_ORDER` | Kitchen | OrderService / SelfOrderService | ส่งออเดอร์เข้าครัว |
| `ORDER_READY` | Floor | KitchenService | อาหารพร้อมเสิร์ฟ |
| `CALL_WAITER` | Floor | SelfOrderService | ลูกค้าเรียกพนักงาน |
| `REQUEST_BILL` | Cashier | OrderService / SelfOrderService | ลูกค้าขอเช็คบิล |
| `REQUEST_CASH_PAYMENT` | Floor | SelfOrderService / CustomerService | ลูกค้าเลือกชำระเงินสด |
| `REQUEST_SPLIT_BILL` | Cashier | SelfOrderService | ลูกค้าขอแยกบิล |
| `SLIP_UPLOADED` | Cashier | CustomerService | ลูกค้าอัพโหลดสลิป |
| `PAYMENT_COMPLETED` | Floor | PaymentService | ชำระเงินเสร็จ |
| `RESERVATION_REMINDER` | Floor | ReservationReminderService | แจ้งเตือนการจองล่วงหน้า |

> **ที่ broadcast SignalR เท่านั้น** (ไม่บันทึก DB) ผ่าน `OrderNotificationService`:
> - Order events: `NewOrderItems`, `ItemStatusChanged`, `ItemCancelled`, `OrderUpdated`, `TableStatusChanged`
> - Customer events: `RefreshOrders`, `BillClaimed`, `BillReleased`, `BillVoided`, `SlipUploaded`, `PaymentCompleted`
> ใช้สำหรับ sync UI ทันที — ไม่ต้องเก็บประวัติ

### 3.5 Read / Clear Logic

```
TbNotificationRead
├── NotificationId + UserId + ReadAt + ClearedAt

ระบบใช้ "cursor pagination":
- ดึง notification ที่ NotificationId < before
- เรียงตาม NotificationId DESC

Filter:
- ตาม TargetGroup ที่ผู้ใช้มีสิทธิ์ (Kitchen/Floor/Cashier/Manager)
- ซ่อน notification ที่ ClearedAt >= CreatedAt (clear ไปแล้ว)

Mark As Read:
- บันทึก ReadAt = now ใน TbNotificationRead
- ส่งผลให้ Badge unread count ลดลง

Clear All:
- บันทึก ClearedAt ของ NotificationRead ล่าสุดของผู้ใช้
- ครั้งต่อไปดูแจ้งเตือน → เห็นเฉพาะที่ CreatedAt > ClearedAt
```

### 3.6 NotificationBroadcaster (กระบวนการกระจายแจ้งเตือน)

```
Backend Service มี business event เกิดขึ้น
   ↓
เรียก NotificationBroadcaster.SendAndBroadcastAsync(model)
   ↓
   ┌─────────────────────────────────┐
   │ 1. บันทึก TbNotification ลง DB  │
   │ 2. ส่ง SignalR event             │
   │    "ReceiveNotification"        │
   │    ผ่าน NotificationHub          │
   │    ไปกลุ่ม TargetGroup          │
   └─────────────────────────────────┘
   ↓
Frontend ที่อยู่ใน group นั้น:
- รับ event → แสดง Toast
- อัพเดต Badge unread count
- เพิ่มเข้า Notification Drawer
```

> **OrderNotificationService (สำหรับ OrderHub) ไม่บันทึก DB** — ใช้ broadcast SignalR อย่างเดียว สำหรับ sync state UI ทันที (เช่น OrderItem status เปลี่ยน → ครัวเห็น)

---

## 4. Workflow การทำงานจริง

### Workflow A — ลูกค้าสั่งอาหารผ่าน Self-Order → ครัวเห็นทันที

```
1. ลูกค้ากด "ส่งออเดอร์" ใน Mobile Web → POST /api/customer/orders
2. OrderService:
   ─ สร้าง TbOrderItem (status = Sent)
   ─ เรียก OrderNotificationService.NotifyNewOrderItemsAsync()
3. OrderHub broadcast "NewOrderItems" ไปกลุ่ม "kitchen", "floor", "table_{tableId}"
4. ผลที่เกิดขึ้นพร้อมกัน:
   ─ ครัวอาหาร (KDS) → รายการใหม่ขึ้นจอ
   ─ พนักงานเสิร์ฟ → Toast "มีออเดอร์ใหม่ที่โต๊ะ A3"
   ─ ลูกค้า Mobile Web → status เปลี่ยนเป็น "Sent"
5. NotificationBroadcaster ส่ง TbNotification "NEW_ORDER" ลง DB + แจ้ง group "Kitchen"
6. ครัวเห็น Toast บน Bell icon + แจ้งเตือนใน Drawer
```

### Workflow B — ครัวทำอาหารเสร็จ → พนักงานเสิร์ฟรู้ทันที

```
1. ครัวอาหารกด "พร้อมเสิร์ฟ" ที่จอ KDS
2. KitchenService:
   ─ อัพเดต OrderItem.Status = Ready
   ─ เรียก NotifyItemStatusChangedAsync()
3. OrderHub broadcast "ItemStatusChanged" ไปกลุ่ม "kitchen", "floor", "table_{tableId}"
4. NotificationBroadcaster ส่ง "ORDER_READY" ไป Floor group
5. ผลที่เกิดขึ้นพร้อมกัน:
   ─ พนักงานเสิร์ฟ → Toast "ผัดไทพร้อมเสิร์ฟ โต๊ะ A3" + ดังในหน้าจอ
   ─ ลูกค้า Mobile Web → status "Ready" + อาจมีไอคอนกระดิ่ง
6. พนักงานเสิร์ฟเดินไปยกของ → กดปุ่ม "เสิร์ฟ"
7. SignalR broadcast อีกครั้ง → status เปลี่ยนเป็น Served
```

### Workflow C — ลูกค้าเรียกพนักงาน (Call Waiter)

```
1. ลูกค้า Mobile Web → กดปุ่ม "เรียกพนักงาน"
2. POST /api/customer/call-waiter
3. ระบบ:
   ─ บันทึก TbNotification (type = CALL_WAITER, TargetGroup = Floor)
   ─ NotificationBroadcaster ส่ง SignalR "ReceiveNotification" ไป Floor
4. พนักงานเสิร์ฟทุกคน → เห็น Toast "ลูกค้าเรียกพนักงาน โต๊ะ A3"
5. คนแรกที่ว่างเดินไปดูแล → ไม่ต้องตอบกลับในระบบ (just informational)
```

### Workflow D — ลูกค้าขอบิล + อัพโหลดสลิป

```
1. ลูกค้า → กด "ขอบิล" ใน Mobile Web
   ─ ระบบเปลี่ยน Order.Status = Billing
   ─ Notification "REQUEST_BILL" ส่งไป Cashier
   ─ แคชเชียร์เห็น Toast "ลูกค้าขอบิล โต๊ะ A3"

2. ลูกค้าเลือก "ชำระเงินสด"
   ─ POST /api/customer/request-cash
   ─ Notification "REQUEST_CASH_PAYMENT" ส่งไป Floor (พนักงานหน้าร้านไปแจ้งแคชเชียร์)
   ─ แคชเชียร์ + พนักงานหน้าร้านเห็น Toast "ลูกค้าโต๊ะ A3 ขอชำระเงินสด"

3. ลูกค้าเลือก "โอน QR" → อัพโหลดสลิป
   ─ POST /api/customer/{qrToken}/upload-slip
   ─ OrderHub broadcast "SlipUploaded" → แคชเชียร์อัพเดต UI ทันที
   ─ NotificationHub ส่ง "SLIP_UPLOADED" ไป Cashier
   ─ แคชเชียร์ → Toast "สลิปอัพโหลดแล้ว โต๊ะ A3" + Badge +1
```

### Workflow E — แคชเชียร์ดูประวัติแจ้งเตือน

```
1. แคชเชียร์ → กด Bell icon บน header
2. Notification Drawer เปิดขึ้น แสดง:
   ─ "ลูกค้าโต๊ะ A3 ขอบิล" (2 นาทีที่แล้ว) [ยังไม่อ่าน]
   ─ "สลิปอัพโหลดแล้ว โต๊ะ A3" (1 นาทีที่แล้ว) [ยังไม่อ่าน]
   ─ "ออเดอร์ใหม่ โต๊ะ B5" (5 นาทีที่แล้ว) [อ่านแล้ว]
3. กดที่รายการ → Mark as Read (เปลี่ยนสี + Badge ลด)
4. กด "เคลียร์ทั้งหมด" → ซ่อนแจ้งเตือนทั้งหมดจาก drawer (Clear timestamp)
```

### Workflow F — Manager เข้าระบบครั้งแรก

```
1. Manager ล็อกอิน (มี permission > 15 หรือมี Kitchen+Floor+Cashier ครบ → join 4 groups: Kitchen, Floor, Cashier, Manager)
2. ทุก event ใน NotificationHub → Manager เห็นทั้งหมด
3. หน้าจอ Manager → Toast ทุกครั้งที่:
   ─ ครัวมีออเดอร์
   ─ พนักงานเสิร์ฟต้องเสิร์ฟ
   ─ แคชเชียร์รับสลิป
   ─ ลูกค้าเรียกพนักงาน
4. Manager เห็นภาพรวมของร้านได้ทั้งหมด
```

---

## 5. ข้อดี

| ข้อดี | คำอธิบาย |
| --- | --- |
| **Real-time แท้** | SignalR WebSocket — เห็น event ภายในมิลลิวินาที |
| **ไม่ใช้ Polling** | ไม่กิน Bandwidth + ไม่ทำให้ Server โหลด |
| **กลุ่มอัตโนมัติตาม Permission** | NotificationHub auto-join ตามตำแหน่งงาน — ไม่ต้องตั้งค่าเอง |
| **Manager เห็นภาพรวม** | มีสิทธิ์ครบ 3 ฝ่าย หรือ permission > 15 → join 4 groups รวด ดูทุก event ได้ |
| **บันทึก DB + เรียกย้อนหลังได้** | ปิด tab → กลับมาเปิด → ยังเห็นแจ้งเตือนที่พลาด (เฉพาะ event ที่ผ่าน NotificationBroadcaster เท่านั้น) |
| **Mark Read / Clear ต่อผู้ใช้** | แต่ละคนมีสถานะ read/clear ของตัวเอง |
| **Badge unread count** | เห็นจำนวนแจ้งเตือนที่ยังไม่อ่านบน Bell icon |
| **กลุ่มแยกชัดเจน** | ครัวอาหารไม่เห็นแจ้งเตือนของครัวเครื่องดื่ม → ไม่รบกวน |
| **Mobile Web ลูกค้าก็ได้รับ event** | Order Tracking real-time → ลูกค้ารู้ทันทีว่าอาหารเป็นยังไง |
| **2 Hub แยกหน้าที่** | OrderHub สำหรับ sync state, NotificationHub สำหรับ alert — ไม่ปน |
| **กรอง notification ตาม TargetGroup** | แสดงเฉพาะที่เกี่ยวกับตัวเอง |
| **Cursor Pagination** | โหลด notification แบบ infinite scroll ได้ |

---

## 6. ข้อเสีย / ข้อจำกัด

| ข้อจำกัด | ผลกระทบ + วิธีรับมือ |
| --- | --- |
| **WebSocket ขาด → ขาดข้อมูล** | ถ้า WiFi ลูกค้า/พนักงานหลุด → ต้อง reconnect — SignalR Client มี auto-reconnect แต่ event ระหว่างที่ขาดอาจหาย |
| **ไม่มี Acknowledge** | ส่งแล้วไม่มีการยืนยันว่ารับได้ — ใช้คู่กับ DB persistence สำหรับ event สำคัญ |
| **Toast อาจถูกพลาดถ้าหน้าจอเต็ม** | ถ้ามีหลาย Toast พร้อมกัน → อาจซ้อนกัน หรือบางอันหายเร็ว |
| **กลุ่ม Manager มีเงื่อนไขซับซ้อน** | กฎ Hard-code (3 groups OR >15 perm บังคับเข้า 4 groups, หรือ >10 perm เพิ่ม Manager) — ปรับเองไม่ได้ ต้องแก้ในโค้ด |
| **Clear ไม่ลบจริง** | ลด clutter ใน UI แต่ข้อมูลยังอยู่ใน DB (กิน storage) |
| **OrderHub Client ต้อง JoinGroup เอง** | ถ้าโค้ด Frontend ลืม join group → ไม่ได้รับ event |
| **OrderHub events ไม่บันทึก DB** | ปิด tab ระหว่างที่ครัวเปลี่ยนสถานะอาหาร → กลับมาเปิดใหม่ event หาย ต้อง refresh page ใหม่ทั้งหมด — event ของ Self-Order ทั้งหมด (NewOrderItems, ItemStatusChanged, RefreshOrders) ไม่อยู่ใน Notification Drawer |
| **Manager Group Logic ซับซ้อน** | เกณฑ์มี 2 เส้นทาง (3 groups OR >15 perm = Manager + บังคับ 4 groups, OR >10 perm = เพิ่ม Manager) — เข้าใจยากเมื่อแก้สิทธิ์พนักงาน |
| **ไม่มี Sound Alert** | ครัวเห็นแค่ Toast — อาจพลาด ต้องมีระบบเสียงเพิ่ม |
| **ไม่รองรับ Mobile Push Notification** | ปิด tab/ปิด browser → ไม่ได้รับแจ้งเตือนเลย |
| **กลุ่ม Kitchen ไม่แยก food/beverage/dessert** | NotificationHub ส่งไป "Kitchen" รวม — ครัวแต่ละสถานีต้อง filter ฝั่ง Client เอง |
| **Notification ค้างเยอะ → ตารางใหญ่** | ไม่มี auto-cleanup — ต้องมี Background Job ลบของเก่า (เกิน 30 วัน) |
| **ตรวจ Permission ใน OnConnectedAsync ครั้งเดียว** | ถ้าเปลี่ยน permission ระหว่าง connect → ต้อง reconnect ใหม่ |
| **WebSocket ผ่าน Reverse Proxy ต้อง config พิเศษ** | Nginx ต้อง Upgrade connection — ถ้า config ผิด → SignalR ไม่ทำงาน |

---

## 7. ความสัมพันธ์กับ Module อื่น

### Module นี้รับข้อมูลจากใคร (รับ event)

**ผ่าน OrderHub (SignalR broadcast เท่านั้น — ไม่บันทึก DB):**

| Module ต้นทาง | SignalR Event | ส่งไปกลุ่ม |
| --- | --- | --- |
| **Order** | NewOrderItems, ItemStatusChanged | kitchen, floor, table_{tableId} |
| **Order** | ItemCancelled | kitchen, floor |
| **Order** | OrderUpdated (Open/Billing/Completed) | floor |
| **Order** | BillVoided | table_{tableId} |
| **Table** | TableStatusChanged | floor |
| **Kitchen** | ItemStatusChanged (Ready/Preparing) | kitchen, floor, table_{tableId} |
| **Payment** | PaymentCompleted, SlipUploaded | floor, table_{tableId} |
| **Customer** | BillClaimed, BillReleased | table_{tableId} |
| **Customer** | RefreshOrders | table_{tableId} |

**ผ่าน NotificationBroadcaster (SignalR + บันทึก TbNotification):**

| Module ต้นทาง | TargetGroup | Event Type |
| --- | --- | --- |
| **Order** (Submit Order / Self-Order Submit) | Kitchen | NEW_ORDER |
| **Order** (Request Bill) | Cashier | REQUEST_BILL |
| **Kitchen** (Mark Ready) | Floor | ORDER_READY |
| **Customer / Self-Order** | Floor | CALL_WAITER, REQUEST_CASH_PAYMENT |
| **Customer / Self-Order** | Cashier | SLIP_UPLOADED, REQUEST_SPLIT_BILL |
| **Payment** (Payment Success) | Floor | PAYMENT_COMPLETED |
| **Reservation Reminder Service** | Floor | RESERVATION_REMINDER |

### Module นี้ส่งข้อมูลไปให้ใคร (รับ event)

| Frontend ปลายทาง | ใช้ทำอะไร |
| --- | --- |
| **Admin Client (KDS)** | แสดงรายการอาหารใหม่ + อัพเดต status real-time |
| **Admin Client (Order Overview)** | อัพเดตสถานะโต๊ะ + ออเดอร์ real-time |
| **Admin Client (Header — Bell icon)** | Toast + Badge + Drawer |
| **Mobile Web (Order Tracking)** | ลูกค้าเห็นสถานะอาหารเปลี่ยน |
| **Mobile Web (Bill)** | ลูกค้าเห็นว่าจ่ายเงินสำเร็จแล้ว |

### Module นี้ดึงข้อมูลจากใคร (สำหรับตอนผู้ใช้ connect)

| Module ต้นทาง | ดึงอะไรมา | ใช้ทำอะไร |
| --- | --- | --- |
| **Authorization** | รายการ Permission ของผู้ใช้ | ตัดสินใจ auto-join group ใน NotificationHub |
| **Human Resource** | EmployeeId + PositionId | หา Permission ของผู้ใช้ |
| **Admin (Auth)** | UserId จาก JWT | ระบุตัวตนผู้ใช้ที่ connect |

---

## 8. สรุปสำหรับรายงาน (1 ย่อหน้า)

> Module Notification เป็นระบบกระดูกสันหลังในการสื่อสารแบบ Real-time ของระบบ RBMS-POS โดยใช้เทคโนโลยี SignalR (WebSocket) ที่แยกออกเป็น 2 Hub ทำงานเสริมกัน คือ OrderHub สำหรับ sync ข้อมูล state ของ Order/Table/Kitchen ไปยังกลุ่มที่ Client เลือก subscribe (kitchen / floor / table_{tableId}) และ NotificationHub สำหรับแสดงการแจ้งเตือนแบบ Toast และจัดเก็บประวัติใน DB เพื่อให้ดูย้อนหลังได้ ที่สำคัญคือ NotificationHub มีระบบ Auto-Join Group ตาม Permission ของผู้ใช้ ทำให้พนักงานในร้านได้รับเฉพาะแจ้งเตือนที่เกี่ยวข้องกับงานของตน (ครัวเห็นเฉพาะออเดอร์เข้าครัว แคชเชียร์เห็นเฉพาะการขอบิลและอัพโหลดสลิป Manager เห็นทุกอย่าง) ทุก event สำคัญในระบบจะถูก broadcast พร้อมๆ กันให้ทั้ง Admin Client (จอ POS), Kitchen Display, และ Mobile Web ของลูกค้า ส่งผลให้ทุกฝ่ายเห็นข้อมูลตรงกันแบบเรียลไทม์ ลดเวลาในการสื่อสารระหว่างทีม ลดข้อผิดพลาดจากการสื่อสารปากเปล่า และยกระดับประสบการณ์ลูกค้าให้ได้รับข้อมูลสถานะอาหารและบิลทันทีโดยไม่ต้องเรียกพนักงาน
