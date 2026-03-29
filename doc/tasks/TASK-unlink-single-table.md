# TASK: แยกโต๊ะลูกออกจากกลุ่มเชื่อมต่อ (Unlink Single Table)

> สร้าง: 2026-03-28 | สถานะ: ✅ เสร็จสมบูรณ์

## สรุปปัญหา
ตอนนี้ปุ่ม "ยกเลิกเชื่อม" ใช้ API เดียวกันทั้งโต๊ะแม่และโต๊ะลูก (`DELETE tables/link/{groupCode}`) ซึ่งยกเลิกเชื่อม **ทั้งกลุ่ม** — ทำให้โต๊ะลูกไม่สามารถแยกตัวเองออกไปเดี่ยวๆ ได้

## เป้าหมาย
- **โต๊ะแม่ (Primary)**: กด "ยกเลิกเชื่อม" → ยกเลิกทั้งกลุ่ม (เหมือนเดิม)
- **โต๊ะลูก (Secondary)**: กด "แยกโต๊ะ" → ดึงตัวเองออกจากกลุ่มเท่านั้น (โต๊ะที่เหลือยังเชื่อมกัน)
- ถ้าแยกแล้วเหลือแค่โต๊ะแม่ตัวเดียว → auto unlink กลุ่มทั้งหมด

## Phase 1: Backend

### Sub-task 1.1: เพิ่ม Interface method ✅
### Sub-task 1.2: Implement UnlinkSingleTableAsync ✅
### Sub-task 1.3: เพิ่ม Controller endpoint ✅

## Phase 2: Frontend

### Sub-task 2.1: แยก logic ปุ่มยกเลิกเชื่อม primary vs secondary ✅
### Sub-task 2.2: เพิ่ม method onUnlinkSingleTable ✅
