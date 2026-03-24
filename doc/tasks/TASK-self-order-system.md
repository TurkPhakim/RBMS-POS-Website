# TASK: Phase 5 — Self-Order System (QR Mobile Web)

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-22
**วันที่เสร็จ**: -
**REQ อ้างอิง**: [REQ-self-order-system.md](../requirements/REQ-self-order-system.md)

> ระบบ QR Self-Order ให้ลูกค้าสแกน QR Code ที่โต๊ะ → Mobile Web → สั่งอาหารเอง → ติดตามสถานะ real-time
> เป็น Angular project ใหม่ (`RBMS-POS-Mobile-Web`) port 4400 ใช้ Backend เดียวกัน (port 5300)

---

## Design / Plan ที่ตกลงกัน

### สถาปัตยกรรม
- **2 Frontend Apps**: RBMS-POS-Client (Staff, port 4300) + RBMS-POS-Mobile-Web (Customer, port 4400)
- **Backend เดียวกัน** (port 5300) — ใช้ shared OpenAPI (gen-api)
- **Stack**: Angular 19.1 + Tailwind 3.4 + PrimeNG 19.1 + SignalR
- **ไม่ใช้**: NgRx, Lottie, pdfmake, qr-code-styling (ไม่จำเป็นสำหรับ mobile web)
- **Auth**: Guest JWT token (4hr) เก็บใน localStorage — ไม่ใช้ Staff JWT

### App Shell Layout
```
┌─────────────────────────────┐
│  RBMS POS   โซนX-โต๊ะY  ชื่อ │  ← Sticky header
├─────────────────────────────┤
│                             │
│        [Content Area]       │  ← Scrollable content
│                             │
├─────────────────────────────┤
│  [เมนู] [ตะกร้า(3)] [สถานะ] │  ← Fixed bottom nav
└─────────────────────────────┘
```

### Responsive Breakpoints
- < 480px → 1 column (menu grid)
- 480–768px → 2 columns
- > 768px → 3 columns

### Customer Flow
```
สแกน QR → Auth → Nickname → เมนู → เลือก+Options → ตะกร้า → สั่ง → ติดตามสถานะ
                                                          ↓
                                              เรียกพนักงาน / ขอบิล
                                                          ↓
                                              รอบิล → สรุปบิล → อัปโหลดสลิป → ชำระเสร็จ
```

### Backend Endpoints (ใหม่ 8 + เดิม 3)

| Endpoint | Auth | รายละเอียด |
|----------|------|-----------|
| `POST /api/customer/auth` | ไม่ต้อง | Validate QR → สร้าง session → return guest token |
| `POST /api/customer/nickname` | Guest | ตั้งชื่อเล่น |
| `GET /api/customer/menu/categories` | Guest | หมวดหมู่ + sub-categories |
| `GET /api/customer/menu/items` | Guest | เมนูตาม filters |
| `GET /api/customer/menu/items/{menuId}` | Guest | Detail + options |
| `POST /api/customer/orders` | Guest | Submit cart → auto-send kitchen |
| `GET /api/customer/orders` | Guest | Order tracking |
| `POST /api/customer/call-waiter` | Guest | Broadcast noti (cooldown 60s) |
| `POST /api/customer/request-bill` | Guest | Order→BILLING |
| `GET /api/customer/{qrToken}/bill` | ไม่ต้อง | (เดิม) ดูบิล |
| `POST /api/customer/{qrToken}/upload-slip` | ไม่ต้อง | (เดิม) อัปโหลดสลิป |
| `GET /api/customer/{qrToken}/bill/{billId}/status` | ไม่ต้อง | (เดิม) สถานะชำระ |

---

## Phase A — Angular Project Setup ✅

### เป้าหมาย
สร้าง Angular project skeleton ที่ compile ได้ + Tailwind + PrimeNG + gen-api config

### เช็คลิสต์
- [ ] สร้าง Angular project ที่ `Frontend-POS/RBMS-POS-Mobile-Web/`
- [ ] ปรับ `angular.json` (port 4400, host 0.0.0.0, standalone: false)
- [ ] ปรับ `package.json` (dependencies ชุดย่อย — ไม่มี NgRx, Lottie, pdfmake)
- [ ] สร้าง `tailwind.config.js` (copy design tokens + เพิ่ม xs breakpoint)
- [ ] สร้าง `postcss.config.js`
- [ ] สร้าง gen-api setup (`ng-openapi-gen.json`, `fix-api-exports.js`, `scripts/`)
- [ ] สร้าง `src/environments/` (environment.ts + environment.prod.ts)
- [ ] สร้าง `src/index.html` (viewport meta, Sarabun font)
- [ ] สร้าง `src/styles.css` (Tailwind + base reset + PrimeNG overrides + bottom sheet)
- [ ] สร้าง `src/app/app.module.ts` (HttpClient, SharedModule, PrimeNG Thai locale)
- [ ] สร้าง `src/app/core/providers/api-config.provider.ts`
- [ ] สร้าง `src/app/shared/shared.module.ts` (PrimeNG ชุดย่อย)
- [ ] Copy `GenericIconComponent` จาก main project
- [ ] Copy icons ที่ต้องใช้ (~20 ไฟล์) + RBMS_Logo.png
- [ ] ทดสอบ `ng serve` — compile ผ่าน + เข้าหน้าว่างได้

---

## Phase B — Backend: Entity + Auth + Endpoints ✅

### เป้าหมาย
เพิ่ม TbCustomerSession entity, Guest JWT, CustomerAuthorize, 8 endpoints ใหม่

### B1: Entity + Migration
- [ ] สร้าง `TbCustomerSession.cs` (ไม่ inherit BaseEntity)
- [ ] สร้าง `TbCustomerSessionConfiguration.cs`
- [ ] เพิ่ม DbSet ใน `POSMainContext.cs` (ไม่ใช้ Global Query Filter)
- [ ] สร้าง `ICustomerSessionRepository` + `CustomerSessionRepository`
- [ ] เพิ่ม CustomerSessions ใน UnitOfWork
- [ ] สร้าง Migration `AddCustomerSessionTable`
- [ ] รัน `dotnet ef database update`

### B2: Guest JWT + CustomerAuthorize
- [ ] เพิ่ม `GenerateCustomerToken()` ใน AuthService/JwtTokenService
- [ ] สร้าง `CustomerAuthorizeAttribute` (IAsyncAuthorizationFilter)

### B3: Customer Service + Controller
- [ ] สร้าง Models (~10 ไฟล์): Auth, Nickname, Category, Menu, Order, Tracking
- [ ] เพิ่ม methods ใน `ICustomerService` + `CustomerService` (8 methods ใหม่)
- [ ] เพิ่ม 8 endpoints ใน `CustomerController`
- [ ] Register DI ใน Program.cs (ถ้าจำเป็น)

### B4: CORS + SignalR
- [ ] เพิ่ม `http://localhost:4400` ใน CORS origins
- [ ] เพิ่ม notification methods (CallWaiter, CustomerOrderSubmitted)
- [ ] ทดสอบทุก endpoint ผ่าน Swagger

---

## Phase C — Frontend Core: Layout + Auth Flow ✅

### เป้าหมาย
App shell (header + bottom nav), auth flow, scan/nickname/expired pages

### เช็คลิสต์
- [ ] **gen-api** — Restart Backend + ตรวจ Swagger + บอกผู้ใช้รัน gen-api
- [ ] สร้าง `customer-auth.service.ts` (token management, localStorage)
- [ ] สร้าง `customer-auth.interceptor.ts` (Bearer token, 401 → /expired)
- [ ] สร้าง `customer.guard.ts` (ตรวจ token valid)
- [ ] สร้าง `app-routing.module.ts` (/scan, /expired, / → lazy CustomerModule)
- [ ] สร้าง Scan page (รับ ?token → POST auth → nickname → redirect)
- [ ] สร้าง Nickname dialog (DynamicDialog, mandatory 1-20 chars)
- [ ] สร้าง Expired page ("QR หมดอายุ กรุณาแจ้งพนักงาน")
- [ ] สร้าง Customer Layout (sticky header + fixed bottom nav + scrollable content)
- [ ] สร้าง Customer Module + Routing (child routes: menu, cart, tracking, bill)
- [ ] ทดสอบ auth flow ทั้ง flow

---

## Phase D — Menu Browse + Detail ✅

### เป้าหมาย
หน้า browse เมนู + bottom sheet detail + options

### เช็คลิสต์
- [ ] สร้าง Menu Module + Routing
- [ ] สร้าง Menu Page (category tabs + sub-category chips + search + responsive grid)
- [ ] สร้าง Menu Card component (รูป + ชื่อ + ราคา + tags)
- [ ] สร้าง Menu Detail Bottom Sheet (dialog position bottom, options radio/checkbox, note, quantity, add to cart)
- [ ] Responsive: 1col < 480, 2col 480-768, 3col > 768
- [ ] ทดสอบบน Chrome DevTools mobile mode

---

## Phase E — Cart + Submit ✅

### เป้าหมาย
Cart service (localStorage) + cart page + submit order flow

### เช็คลิสต์
- [ ] สร้าง `cart.service.ts` (signals: items, totalPrice, itemCount — localStorage persistence)
- [ ] สร้าง Cart Module + Routing
- [ ] สร้าง Cart Page (items list + options + note + qty +/- + delete + total + submit btn)
- [ ] Submit flow: confirm dialog → POST orders → clear cart → navigate /tracking
- [ ] Empty state: "ตะกร้าว่าง" + ปุ่ม "ดูเมนู"
- [ ] ทดสอบ add/edit/remove items + submit

---

## Phase F — Order Tracking (Real-time) ✅

### เป้าหมาย
หน้าติดตามสถานะ order แบบ real-time ผ่าน SignalR

### เช็คลิสต์
- [ ] สร้าง `signalr.service.ts` (OrderHub connection, JoinGroup, events listener)
- [ ] สร้าง Tracking Module + Routing
- [ ] สร้าง Tracking Page (items grouped by batch, status badges, orderedBy, real-time updates)
- [ ] Status display: SENT(รอทำ), PREPARING(กำลังทำ+pulse), READY(เสร็จแล้ว), SERVED(เสิร์ฟแล้ว), CANCELLED(ยกเลิก)
- [ ] ฟัง events: ItemStatusChanged, NewOrderItems, OrderUpdated, TableClosed
- [ ] ทดสอบ real-time: เปลี่ยนสถานะจาก KDS → mobile web อัพเดตทันที

---

## Phase G — Actions + Bill + Slip Upload ✅

### เป้าหมาย
เรียกพนักงาน, ขอบิล, หน้ารอบิล/สรุปบิล/อัปโหลดสลิป/ชำระเสร็จ

### เช็คลิสต์
- [ ] เรียกพนักงาน (header btn + cooldown 60s + countdown display)
- [ ] ขอบิล (header btn + confirm dialog + POST request-bill)
- [ ] สร้าง Bill Module + Routing
- [ ] สร้าง Bill Waiting Page ("กำลังจัดเตรียมบิล" + SignalR listen BillPrepared)
- [ ] สร้าง Bill Summary Page (GET bill → รายการ + charges + total + ปุ่ม upload slip)
- [ ] สร้าง Slip Upload Page (เลือกรูป + preview + POST upload-slip → OCR result)
- [ ] สร้าง Payment Complete Page (SignalR PaymentCompleted → "ชำระเรียบร้อย")
- [ ] ทดสอบ full bill flow

---

## สรุปไฟล์ Frontend

```
Frontend-POS/RBMS-POS-Mobile-Web/
├── angular.json, package.json, tailwind.config.js
├── ng-openapi-gen.json, fix-api-exports.js, scripts/
├── public/icons/ (~20 files), public/images/
└── src/app/
    ├── core/ (api/, guards/, interceptors/, providers/, services/)
    ├── shared/ (shared.module.ts, generic-icon/)
    ├── layouts/customer-layout/
    └── features/
        ├── scan/ (scan-page + nickname-dialog)
        ├── expired/
        ├── customer/ (wrapper module)
        ├── menu/ (menu-page + menu-card + menu-detail-sheet)
        ├── cart/ (cart-page)
        ├── tracking/ (tracking-page)
        └── bill/ (bill-waiting + bill-summary + slip-upload + payment-complete)
```

---

## Phase H — UI Redesign (อ้างอิง Staff-Order)

### เป้าหมาย
ปรับดีไซน์ Mobile Web ทั้งหมดให้สวยขึ้น อ้างอิงดีไซน์จาก `app-staff-order` ที่เสร็จแล้ว
ปรับให้เหมาะกับมือถือลูกค้า (touch-friendly, ขนาดใหญ่ขึ้น, สีสดใส)

### อ้างอิงไฟล์
- `staff-order.component.html` → menu grid, card design, category tabs, search, sub-category chips
- `staff-order.component.ts` → CategoryTab interface, filter logic
- `menu-item-dialog.component.html` → option selection UI

### เช็คลิสต์
- ✅ **H1: Customer Layout** — Header gradient + Bottom nav ขนาดใหญ่ + active state highlight
- ✅ **H2: Menu Browse** — Category segmented control with icons + Search with clear + Sub-category chips border-2
- ✅ **H3: Menu Card** — Rich card: aspect-square image, tag badges (แนะนำ/ใหม่), ชื่อ TH+EN, price ตัวใหญ่
- ✅ **H4: Menu Detail Sheet** — option toggle buttons (ไม่ใช่ radio/checkbox), qty round buttons, footer sticky
- ✅ **H5: Cart Page** — gradient header, card-style items, round qty control, total bar primary-subtle

---

## Phase I — เพิ่ม Icons + Data ให้ครบตาม Staff-Order + Header ใช้ชื่อร้าน

### เป้าหมาย
เพิ่ม fields ที่ขาดใน API → ให้ Mobile Web แสดงข้อมูลเมนูครบเหมือน Staff-Order
Header ใช้ชื่อร้าน + Logo จริงจาก ShopSettings แทน hardcode "RBMS POS"

### ไฟล์ที่แก้

**Backend:**
- `CustomerAuthResponseModel.cs` — เพิ่ม ShopNameThai, LogoFileId
- `CustomerMenuItemResponseModel.cs` — เพิ่ม IsPinned, Tags, HasOptions, CaloriesPerServing, Allergens
- `SelfOrderService.cs` — ดึง ShopSettings ตอน Auth, ดึง fields ใหม่ตอน GetMenuItems

**Frontend (หลัง gen-api):**
- Copy icons: `clover-tag`, `time-tag`, `pin-tag`, `shield-warning`
- `customer-layout.component.ts` — Header แสดง Logo + ชื่อร้านจาก session
- `menu-card.component.ts` — เพิ่ม pinned badge, tag badges ครบ 3 แบบ, allergens, calories, hasOptions indicator
- `customer-auth.service.ts` — เก็บ shopNameThai, logoFileId ใน session

### เช็คลิสต์
- ✅ **I1: BE — CustomerAuthResponseModel** เพิ่ม ShopNameThai + LogoFileId
- ✅ **I2: BE — CustomerMenuItemResponseModel** เพิ่ม IsPinned, Tags, HasOptions, CaloriesPerServing, Allergens
- ✅ **I3: BE — SelfOrderService** อัพเดต AuthenticateAsync (ดึง ShopSettings) + GetMenuItemsAsync (ดึง fields ใหม่ + Include MenuOptionGroups + เรียง Pinned ก่อน)
- ✅ **I4: gen-api** ผู้ใช้รันแล้ว — ตรวจ generated models ครบ
- ✅ **I5: FE — Copy missing icons** (clover-tag, time-tag, pin-tag, shield-warning) จาก Staff app
- ✅ **I6: FE — customer-auth.service** เปลี่ยน saveSession เป็น object param + เก็บ shopNameThai, logoFileId + แก้ auth.component caller
- ✅ **I7: FE — Header** ใช้ Logo จาก API (`/api/admin/file/{logoFileId}`) + ชื่อร้านจาก session.shopNameThai
- ✅ **I8: FE — Menu Card** เพิ่ม pinned badge (pin-tag), tag badges 3 แบบ (thumb-tag/clover-tag/time-tag), allergens (shield-warning), calories (thunder+Kcal), hasOptions (option-extra+"มีตัวเลือก"), ราคา text-xl+"บาท"

---

## หมายเหตุ
- **ก่อน Phase C**: ต้องรัน gen-api (บอกผู้ใช้รัน + หยุดรอ)
- **ทดสอบมือถือ**: `ng serve` ตั้ง host 0.0.0.0 → โทรศัพท์ WiFi เดียวกัน → `http://{IP}:4400/scan?token=xxx`
- **Cart เป็น per-device (localStorage)** — ไม่ sync ข้าม device
- **OrderHub เดิม** — customer join group `table_{tableId}` ไม่ต้องสร้าง Hub ใหม่
