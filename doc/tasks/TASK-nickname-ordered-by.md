# TASK: ระบบชื่อเล่นลูกค้า (Nickname) + แสดงผู้สั่งใน OrderedBy

> สร้าง: 2026-03-29

## สถานะ: ✅ เสร็จสมบูรณ์

## Context
- `TbOrderItem.OrderedBy` ลูกค้าเก็บ `"customer:{sessionId}"` → Admin เห็น raw string
- พนักงานเก็บ `"ชื่อ นามสกุล"` → ไม่มี prefix ไม่สม่ำเสมอ
- ลูกค้าไม่ถูกบังคับใส่ชื่อเล่นก่อนสั่ง

## เป้าหมาย
- ลูกค้าต้องใส่ชื่อเล่นก่อนสั่ง (mandatory dialog บน Mobile Web)
- แสดงผู้สั่ง: `customer:42` → **"คุณน้อง"**, `staff:5` → **"พนักงานสมชาย"** (ไม่เว้นวรรค, ชื่อจริง)
- ข้อมูลเก่า (format เดิม) → แสดงตามเดิม (backward compat)

## สิ่งที่มีอยู่แล้ว
- `TbCustomerSession.Nickname` — field มีอยู่แล้ว (nullable)
- `SelfOrderService.SetNicknameAsync()` — API method มีแล้ว
- `POST /api/customer/nickname` — endpoint มีแล้ว
- `SetNicknameRequestModel` — generated model มีแล้ว
- ไม่ต้องสร้าง Migration

---

## Phase 1: Backend — OrderedBy Format + Resolve

### 1.1 เปลี่ยน Staff OrderedBy → `staff:{employeeId}` ✅
- `OrderService.cs` → `GetCurrentEmployeeNameAsync()` → เปลี่ยนเป็น `GetCurrentStaffIdentifier()` return `$"staff:{employeeId}"`

### 1.2 สร้าง ResolveOrderedByAsync ✅
- Batch resolve `customer:{id}` → "คุณ{nickname}" + `staff:{id}` → "พนักงาน{firstName}"
- ใช้ `_unitOfWork.CustomerSessions.QueryNoTracking()` + `_unitOfWork.Employees.QueryNoTracking()`

### 1.3 Apply Resolve ใน methods ✅
- `GetOrderByIdAsync` — ใช้ใน order detail (Admin) + ถูกเรียกจาก 5 methods อื่น
- `GetActiveOrderByTableIdAsync` — ใช้ใน staff-order page

### 1.4 แก้ SelfOrderService ✅
- `FormatOrderedBy` → รับ `nicknameMap` parameter, resolve `customer:{id}` → "คุณ{nickname}"
- `GetOrdersAsync` → build nicknameMap ก่อน LINQ Select
- `SubmitOrderAsync` → validate ว่ามี nickname แล้ว (throw BusinessException ถ้าไม่มี)

### 1.5 เพิ่ม Nickname ใน Auth Response ✅
- `CustomerAuthResponseModel` มี `Nickname` field อยู่แล้ว — ไม่ต้องแก้

### 1.6 Build + ตรวจ Swagger ✅
- เพิ่ม `QueryNoTracking()` ใน `ICustomerSessionRepository` + `CustomerSessionRepository`
- Build สำเร็จ

## Phase 2: Frontend Mobile Web — Nickname Dialog

### 2.1 สร้าง Nickname Dialog ✅
- สร้าง `shared/dialogs/nickname-dialog/` (component + template)
- mandatory (closable: false), input 1-20 ตัวอักษร
- เรียก `selfOrderSetNicknamePost` → save localStorage ผ่าน `CustomerAuthService.updateNickname()`
- Declare ใน SharedModule

### 2.2 แสดง Dialog ใน Customer Layout ✅
- `customer-layout.component.ts` → ngOnInit: ตรวจ nickname จาก session → ถ้าไม่มี → เปิด Dialog

### 2.3 แสดง Nickname บน Header ✅
- header: `โซนA - โต๊ะ5 | คุณน้อง`
- ใช้ `@if (nickname())` conditional rendering

---

## ไฟล์ที่แก้/สร้าง

| ไฟล์ | การแก้ |
|------|--------|
| `Business.Order/Services/OrderService.cs` | แก้ OrderedBy format + ResolveOrderedByAsync |
| `Business.Payment/Services/SelfOrderService.cs` | แก้ FormatOrderedBy + validate + nicknameMap |
| `Repositories/Interfaces/ICustomerSessionRepository.cs` | เพิ่ม `QueryNoTracking()` |
| `Repositories/Implementations/CustomerSessionRepository.cs` | เพิ่ม `QueryNoTracking()` |
| `Mobile-Web/shared/dialogs/nickname-dialog/*` | **สร้างใหม่** |
| `Mobile-Web/shared/shared.module.ts` | declare NicknameDialogComponent |
| `Mobile-Web/layouts/customer-layout/*` | เพิ่ม nickname check + dialog + header |
