# TASK: Mobile Web Design Review — ตรวจสอบดีไซน์ทุกหน้า

> สถานะ: 🔄 กำลังดำเนินการ
> สร้างเมื่อ: 2026-03-23

## เป้าหมาย

ตรวจสอบและยืนยันดีไซน์ทุกหน้าใน Mobile Web (Self-Order) ก่อนปิด Phase 5
แต่ละหน้าต้อง mock มาเป็น test page ให้ผู้ใช้ดูก่อน แล้วนำดีไซน์กลับไปใช้จริง

## สถานะรายหน้า

### หน้าที่ยืนยันดีไซน์แล้ว (ไม่ต้อง mock)

| หน้า | สถานะ | หมายเหตุ |
|------|--------|---------|
| auth (QR login) | ✅ เสร็จ | gradient + Lottie + error state |
| expired (session หมดอายุ) | ✅ เสร็จ | Lottie + text |
| bill-waiting (รอบิล) | ✅ เสร็จ | ผ่าน test-bill-waiting ปรับ animation size/margins แล้ว |
| customer-layout (header + footer + nav) | ✅ เสร็จ | icons ปรับครบ (restaurant, address-location, web, email, facebook, instagram) |

### หน้าที่ต้อง mock + ยืนยันดีไซน์

| หน้า | สถานะ | test page | หมายเหตุ |
|------|--------|-----------|---------|
| bill-summary (สรุปรายการ) | ✅ เสร็จ | `/test-bill-summary` | ยืนยันดีไซน์แล้ว + นำไปใช้จริง + เพิ่มชำระเงินสด |
| slip-upload (อัปโหลดสลิป) | ⬜ รอตรวจ | `/test-slip-upload` | upload area + preview + payment ref + result |
| payment-complete (ชำระเสร็จ) | ⬜ รอตรวจ | `/test-payment-complete` | สถานะ waiting + completed |
| menu-browse (เมนู) | ⬜ ยังไม่ mock | — | category tabs + search + grid + sub-category chips |
| menu-detail-sheet (รายละเอียดเมนู) | ⬜ ยังไม่ mock | — | bottom sheet + options + qty + add to cart |
| cart-page (ตะกร้า) | ⬜ ยังไม่ mock | — | item list + note + qty + delete + footer total |
| order-tracking (ติดตามออเดอร์) | ⬜ ยังไม่ mock | — | status badges + items + summary |
| confirm-dialog | ⬜ ยังไม่ mock | — | simple confirm dialog |

---

## Phase ปัจจุบัน — Bill Flow (3 หน้า)

### Sub-tasks

- ⬜ สร้าง `test-bill-summary` — mock header + grouped items (อาหาร/เครื่องดื่ม/ของหวาน) + charges + footer button
- ⬜ สร้าง `test-slip-upload` — mock header + upload area + preview state + payment ref + result card
- ⬜ สร้าง `test-payment-complete` — mock header + waiting state + completed state (แสดงทั้ง 2 สถานะ)
- ⬜ ลงทะเบียน test pages (app-routing + app.module)
- ⬜ ผู้ใช้ตรวจดีไซน์ + ปรับแก้
- ⬜ นำดีไซน์กลับไปหน้าจริง
- ⬜ ลบ test pages ทั้งหมด

---

## ดีไซน์ปัจจุบันของแต่ละหน้า (ก่อนปรับ)

### bill-summary
- Header: gradient primary → checklist-cash icon + "สรุปรายการสั่ง" + order number + item count badge
- Items: grouped by categoryType (Food=primary, Beverage=info, Dessert=billing) + icon ต่าง size
- Charges: subTotal, serviceCharge, VAT, discount, grandTotal
- Footer: fixed button "อัปโหลดสลิป"
- **จุดที่อาจต้องปรับ**: charges section ยังเรียบ, footer button ยังไม่มี gradient

### slip-upload
- **ดีไซน์ยังเรียบมาก** — ไม่มี gradient, icon เป็น pi pi-camera, ไม่มี header card
- Upload area: dashed border + pi pi-camera + text
- Preview: img + delete button
- Payment ref: simple input
- Result: success card with OCR amount
- **ต้องปรับ**: เพิ่ม header card, ปรับ upload area ให้สวยขึ้น, result card ต้อง styled

### payment-complete
- **ดีไซน์ยังเรียบมาก** — แค่ icon + text, ไม่มี gradient/card/animation
- Waiting: pi pi-spinner + text
- Completed: pi pi-check-circle + text
- **ต้องปรับ**: เพิ่ม Lottie animation, card styled, gradient elements
