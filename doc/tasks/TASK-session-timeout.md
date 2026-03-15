# TASK: Session Timeout (Idle Timeout + Re-authentication)

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-15
**วันที่เสร็จ**: -

> สร้างระบบ idle timeout ที่ติดตาม activity ของผู้ใช้ → idle 30 นาที → Modal เตือน (countdown 5 นาที) → ออกจากระบบ หรือ ยืนยันรหัสผ่านเพื่อใช้งานต่อ
> เอกสารอ้างอิง: Plan file `fluttering-jingling-spring.md`

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- Dialog ต้องสร้างแยก component + ใช้ `<app-card-template>` layout
- Dialog เปิดด้วย `showHeader: false`, `styleClass: 'card-dialog'`, `width: '30vw'`
- Event listeners ต้อง register นอก NgZone (ไม่ trigger change detection)
- ไม่สร้าง interceptor เพิ่มสำหรับ API activity tracking (mousemove/keydown/click/scroll เพียงพอ)
- Backend endpoint ไม่ increment FailedLoginAttempts (Frontend จำกัด 3 ครั้งเอง)

---

## Dependencies / สิ่งที่ต้องเตรียม

- ไม่มี dependency ภายนอก — ใช้ code ที่มีอยู่ทั้งหมด
- Existing: `_passwordHasher.VerifyPassword()`, `InvalidCredentialsException`, `BaseController.GetUserId()`, `ModalService`, `DialogService`, `<app-card-template>`, icons (lock, eye, eye-off), `warning-image.png`

---

## แผนการทำงาน

### Phase 1 — Backend: Verify Password Endpoint

กระทบ: Auth module (Backend) | ความซับซ้อน: ต่ำ

#### 1.1 สร้าง VerifyPasswordRequestModel (`POS.Main.Business.Admin/Models/Auth/`)

**ปัญหาปัจจุบัน:**
- ไม่มี endpoint สำหรับ verify password ของ user ที่ login อยู่

**เป้าหมาย:**
- สร้าง request model มี field `Password` (string)

#### 1.2 เพิ่ม method ใน IAuthService + AuthService

**ปัญหาปัจจุบัน:**
- AuthService มี verify password logic ใน LoginAsync แต่ไม่มี method แยกสำหรับ re-verification

**เป้าหมาย:**
- เพิ่ม `VerifyPasswordAsync(Guid userId, string password, CancellationToken)` → ใช้ `_passwordHasher.VerifyPassword()` + throw `InvalidCredentialsException`

#### 1.3 เพิ่ม endpoint ใน AuthController

**ปัญหาปัจจุบัน:**
- ไม่มี verify-password endpoint

**เป้าหมาย:**
- `[HttpPost("verify-password")]` → `POST /api/admin/auth/verify-password`
- ใช้ `[Authorize]` จาก class-level, ใช้ `GetUserId()` จาก BaseController

#### 1.4 Regenerate API Client

- รัน `npm run gen-api` → ได้ `authVerifyPasswordPost()` ใน generated AuthService

---

### Phase 2 — Frontend: SessionTimeoutService

กระทบ: Core services (Frontend) | ความซับซ้อน: สูง

#### 2.1 สร้าง SessionTimeoutService (`core/services/`)

**ปัญหาปัจจุบัน:**
- ไม่มีกลไก idle timeout ใดๆ

**เป้าหมาย:**
- Service `providedIn: 'root'` ที่ track user activity, จัดการ timer, sync ข้าม tabs
- Constants: IDLE 30 นาที, WARNING 5 นาที, localStorage keys
- Activity tracking: mousemove, keydown, click, scroll (นอก NgZone, throttle 30 วินาที)
- Multi-tab sync: localStorage `storage` event
- Methods: `start()`, `stop()`, `resetTimer()`, `showWarningDialog()`, `showVerifyDialog()`, `performLogout()`

---

### Phase 3 — Frontend: Session Timeout Warning Dialog

กระทบ: Shared modals (Frontend) | ความซับซ้อน: ปานกลาง

#### 3.1 สร้าง SessionTimeoutComponent (`shared/modals/session-timeout/`)

**ปัญหาปัจจุบัน:**
- ไม่มี session timeout warning dialog

**เป้าหมาย:**
- Warning dialog + countdown MM:SS (signal + setInterval)
- ปุ่ม: "ออกจากระบบ" / "อยู่ต่อ"
- countdown = 0 → auto-logout
- ใช้ `<app-card-template>`, `card-dialog` styleClass

---

### Phase 4 — Frontend: Verify Password Dialog

กระทบ: Shared dialogs (Frontend) | ความซับซ้อน: ปานกลาง

#### 4.1 สร้าง VerifyPasswordDialogComponent (`shared/dialogs/verify-password/`)

**ปัญหาปัจจุบัน:**
- ไม่มี dialog ยืนยันรหัสผ่าน

**เป้าหมาย:**
- Password input + toggle visibility
- จำกัด 3 ครั้ง → auto-logout
- เรียก `authVerifyPasswordPost()` (generated API)
- ใช้ `<app-card-template>`, `card-dialog` styleClass

---

### Phase 5 — Integration

กระทบ: MainLayout, AuthInterceptor, AuthService, SharedModule | ความซับซ้อน: ปานกลาง

#### 5.1 MainLayoutComponent — start/stop service

**ปัญหาปัจจุบัน:**
- MainLayout ไม่มี lifecycle hooks

**เป้าหมาย:**
- OnInit → `sessionTimeout.start()`, OnDestroy → `sessionTimeout.stop()`

#### 5.2 AuthInterceptor — แก้ skip logic

**ปัญหาปัจจุบัน:**
- `request.url.includes('/api/admin/auth/')` → skip ทุก auth endpoint (ไม่แนบ token)

**เป้าหมาย:**
- Skip เฉพาะ anonymous endpoints (login, refresh-token, forgot-password, verify-otp, reset-password)
- verify-password ต้องแนบ Bearer token

**Class เก่า → ใหม่:**
```
request.url.includes('/api/admin/auth/') → skip เฉพาะ specific anonymous endpoints
```

#### 5.3 AuthService — เพิ่ม session cleanup

**ปัญหาปัจจุบัน:**
- `clearAuthData()` ไม่ clear session timeout keys

**เป้าหมาย:**
- เพิ่ม `localStorage.removeItem('session_last_activity')` + `localStorage.removeItem('session_state')`

#### 5.4 SharedModule — declare components

**เป้าหมาย:**
- เพิ่ม `SessionTimeoutComponent`, `VerifyPasswordDialogComponent` ใน declarations

---

### Phase 6 — เอกสาร

กระทบ: doc/ | ความซับซ้อน: ต่ำ

#### 6.1 อัพเดต database-api-reference.md

- เพิ่ม `POST /api/admin/auth/verify-password` endpoint

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 1  Backend Endpoint       ← ต้องมีก่อน gen-api
2. Phase 3  Warning Dialog         ← SessionTimeoutService ต้องใช้
3. Phase 4  Verify Password Dialog ← SessionTimeoutService ต้องใช้
4. Phase 2  SessionTimeoutService  ← ต้องมี dialogs ก่อน
5. Phase 5  Integration            ← เชื่อมทุกอย่างเข้าด้วยกัน
6. Phase 6  เอกสาร                  ← อัพเดตหลังสุด
```

---

## หมายเหตุ

- สำหรับ testing ให้ลดค่า `IDLE_TIMEOUT_MS` เหลือ 30 วินาทีเพื่อทดสอบได้เร็ว
- Multi-tab sync ใช้ `window.addEventListener('storage', ...)` ซึ่ง fire เฉพาะ tab อื่น (ไม่ fire ใน tab ที่เปลี่ยน localStorage)
