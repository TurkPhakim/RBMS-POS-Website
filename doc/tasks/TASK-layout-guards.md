# TASK: Layout Restructure + Guards + Access Denied

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-11
**วันที่เสร็จ**: 2026-03-11

> ปรับโครงสร้าง Layout + เพิ่ม Guard ป้องกัน route + หน้า access-denied + error interceptor

---

## แผนการทำงาน

### Phase 1 — สร้าง Components และ Guards ใหม่

#### 1.1 สร้าง AuthLayoutComponent (`layouts/auth-layout/`)

**ปัญหาปัจจุบัน:**
- ไม่มี layout แยกสำหรับหน้า auth — route `/auth` ใช้แค่ `loadChildren` ตรงๆ ไม่มี wrapper

**เป้าหมาย:**
- สร้าง `AuthLayoutComponent` (standalone: false) มีแค่ `<router-outlet>`
- Declare ใน `layouts.module.ts`

#### 1.2 สร้าง GuestGuard (`core/guards/guest.guard.ts`)

**ปัญหาปัจจุบัน:**
- ไม่มี guard ป้องกันคนที่ login แล้วจากการเข้าหน้า login ซ้ำ

**เป้าหมาย:**
- ตรวจ `authService.isAuthenticated` → ถ้า login แล้ว redirect ไป `/`
- ใช้ pattern เดียวกับ AuthGuard (CanActivate interface)

#### 1.3 สร้าง AccessDeniedComponent (`shared/pages/access-denied/`)

**ปัญหาปัจจุบัน:**
- ไม่มีหน้า access-denied — RoleGuard redirect ไป `/unauthorized` ที่ไม่มีอยู่จริง

**เป้าหมาย:**
- แสดงข้อความ "คุณไม่มีสิทธิ์เข้าถึงหน้านี้" + ปุ่ม "ย้อนกลับ" (Location.back())
- ใช้ Tailwind design tokens, `pi pi-lock` icon
- Declare ใน SharedModule

### Phase 2 — ปรับ Routing และ Guards เดิม

#### 2.1 ปรับ layout-routing.module.ts

**ปัญหาปัจจุบัน:**
- route ที่ใช้ MainLayoutComponent ซ้ำหลายที่ (hr, menu, order, table ฯลฯ แยกเป็น block ตัวเอง)
- ไม่มี guard บน route ใดเลย

**เป้าหมาย:**
- รวม route ทั้งหมดที่ใช้ MainLayoutComponent ไว้ใต้ `path: ''` ตัวเดียว + `canActivate: [AuthGuard]`
- Auth route ใช้ `AuthLayoutComponent` + `canActivate: [GuestGuard]`
- เพิ่ม `access-denied` route

#### 2.2 แก้ AuthGuard + RoleGuard

**ปัญหาปัจจุบัน:**
- AuthGuard redirect ไป `/login` (ผิด path — ควรเป็น `/auth/login`)
- RoleGuard redirect ไป `/unauthorized` (ไม่มี route นี้)

**เป้าหมาย:**
- AuthGuard redirect → `/auth/login`
- RoleGuard redirect → `/access-denied` + login redirect → `/auth/login`

### Phase 3 — Error Interceptor + AuthService

#### 3.1 ปรับ AuthInterceptor

**ปัญหาปัจจุบัน:**
- ไม่มี error handling — แค่ attach token แล้วส่งต่อ

**เป้าหมาย:**
- เพิ่ม catchError: 401 → clear auth + redirect login, 403 → redirect access-denied
- Skip error handling สำหรับ auth endpoints

#### 3.2 เพิ่ม clearAndRedirectToLogin() ใน AuthService

**ปัญหาปัจจุบัน:**
- logout() เรียก API + redirect `/auths/login` (path พิมพ์ผิด)
- ไม่มี method สำหรับ force logout (token expired) ที่ไม่ต้องเรียก API

**เป้าหมาย:**
- เพิ่ม `clearAndRedirectToLogin()` — เคลียร์ localStorage + navigate `/auth/login`
- แก้ logout() redirect จาก `/auths/login` → `/auth/login`

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 1.1-1.3  สร้างไฟล์ใหม่ทั้งหมด      ← ไม่กระทบโค้ดเดิม
2. Phase 2.2      แก้ Guards เดิม              ← เตรียม guard ให้พร้อมก่อนใช้
3. Phase 3.2      แก้ AuthService              ← เตรียม method ให้ interceptor ใช้
4. Phase 3.1      ปรับ AuthInterceptor         ← ใช้ AuthService method ที่เพิ่มมา
5. Phase 2.1      ปรับ routing                 ← ใช้ทุก component/guard ที่สร้างไว้
```
