# มาตรฐาน Diagram สำหรับรายงาน RBMS-POS

> กฎและการตั้งค่าสำหรับสร้าง Diagram ทุกประเภทในรายงานปริญญานิพนธ์ (System Architecture, Flowchart, ER Diagram, ฯลฯ) โดยใช้ **draw.io** เป็นเครื่องมือหลัก
>
> **อัพเดต 2026-05-31**: ยืนยันจากตัวอย่างจริงที่ผู้จัดทำสร้าง — Layer 3 (Backend) เป็น 2×2 grid + เส้น orthogonal ไม่โค้ง

---

## 1. เครื่องมือและ Workflow

### 1.1 เครื่องมือหลัก

| ลำดับ | เครื่องมือ | จุดประสงค์ |
|-------|------------|------------|
| 1 | **Mermaid Code ใน .md** | Source of Truth — เก็บใน [doc/report/05-chapter-3-design.md](../report/05-chapter-3-design.md) |
| 2 | **draw.io** (https://app.diagrams.net/) | สร้าง + แก้ไข Diagram จริง |
| 3 | **PNG Export** | ใช้ใน Word/PDF ของรายงาน |

### 1.2 Workflow (5 ขั้นตอน)

```
1. เขียน Mermaid Code ใน .md (Source of Truth)
2. เปิด draw.io → คลิก + (Insert) → Advanced → Mermaid
3. วาง Code → Insert → ได้กล่องและเส้นใน Canvas
4. ปรับใน draw.io: ตำแหน่ง, สี, เส้นตรง, ขนาด
5. Save .drawio + Export PNG (ใส่ในรายงาน Word)
```

**สำคัญ**: เก็บ **ไฟล์ `.drawio`** ไว้ — กลับมาแก้ภายหลังได้

---

## 2. กฎ Layout

### 2.1 ทิศทางหลัก

- **แนวตั้ง (Top-Bottom)** เป็นค่าเริ่มต้นของทุก Diagram
- ใน Mermaid: ใช้ `graph TB` ตอนเริ่ม

### 2.2 ภายในแต่ละ Subgraph/Layer

| จำนวน Element | ทิศทาง | หมายเหตุ |
|----------------|---------|-----------|
| 1 Element | (ไม่มี subgraph) | กล่องเดียวอยู่บน Diagram |
| 2 Elements | **TB** (แนวตั้ง) | กรณีเป็น "ผู้ใช้งาน" (Admin/Customer) |
| 2 Elements | **LR** (แนวนอน) | กรณีเป็น "Storage" (SQL/MinIO) หรือ "External" |
| 3-4 Elements | **2×2 grid** | ใช้ nested subgraph (Row1, Row2) |
| 5+ Elements | **2×N grid** | แตกเป็นหลายแถว |

### 2.3 ลำดับ Layer (แนวตั้ง)

จากบนลงล่าง:
1. **Users** (ผู้ใช้งาน) — บนสุด
2. **Gateway/Network** (Nginx)
3. **Backend** (Logic Layer)
4. **Data Storage** (Database + Object Storage)
5. **External Services** (3rd-party — Email, ReCaptcha)

---

## 3. กฎการตั้งชื่อ

### 3.1 ชื่อ Layer (Subgraph Title)

รูปแบบ: **`Layer N — ชื่อภาษาอังกฤษ`**

ตัวอย่าง:
- ✅ `Layer 1 — Users`
- ✅ `Layer 3 — Backend (ASP.NET Core 9.0 :5300)`
- ❌ `กลุ่มผู้ใช้งาน` (ห้ามใช้ภาษาไทยใน Diagram — Word ตอน Export อาจมีปัญหา font)

### 3.2 ชื่อกล่อง (Node)

**ภาษาอังกฤษ** + **ข้อมูลสำคัญใน 1-2 บรรทัด**

ตัวอย่าง:
- ✅ `Admin / Staff Web<br/>Port: 4300`
- ✅ `REST API · 23 Controllers · 215 Endpoints`
- ❌ `ผู้ดูแลระบบและพนักงาน เว็บแอปพลิเคชันที่พอร์ต 4300` (ยาวเกินไป)

**แยกข้อมูลด้วย `·` (middle dot)** สำหรับข้อมูลในบรรทัดเดียวกัน
- ตัวอย่าง: `Business Logic · 8 Modules`

### 3.3 Label บนเส้น (Edge Label)

**สั้น กระชับ** — ระบุประเภทการสื่อสาร

ตัวอย่าง:
- ✅ `HTTPS`
- ✅ `/api + /hubs`
- ✅ `EF Core`
- ✅ `S3 API`
- ❌ `Hypertext Transfer Protocol Secure ที่ใช้ในการสื่อสาร...` (อย่ายาว)

---

## 4. กฎเส้น (Edges)

### 4.1 รูปแบบเส้น

| รูปแบบ | ใช้กับ | Mermaid Syntax |
|--------|--------|-----------------|
| **เส้นทึบ (solid)** | การสื่อสารหลัก HTTP/REST | `-->` |
| **เส้นประ (dashed)** | Optional / Async / Real-time | `-.->` (ถ้าต้องการแยก) |
| **เส้นแนวตั้ง** | ลูกศรชี้ลง (Layer ต่อ Layer) | TB direction |

### 4.2 ความโค้งของเส้น

**ต้องเป็นเส้นตรง orthogonal** (มุมฉาก) — ไม่ใช่เส้นโค้ง

**วิธีตั้งใน draw.io หลัง Import จาก Mermaid**:

1. คลิกเส้นใดเส้นหนึ่ง → กด **Ctrl+E**
2. แก้บรรทัด `curved=1` เป็น `curved=0`
3. หรือเพิ่ม `edgeStyle=orthogonalEdgeStyle;` ตอนต้น
4. กด Apply
5. คัดลอก Style ไปเส้นอื่น: คลิกขวา → Edit Style → Copy → คลิกเส้นอื่น → Paste

**ทางลัด — ตั้ง Default ของทั้ง Diagram**:
1. คลิกพื้นที่ว่างของ Canvas
2. Right Sidebar → **Diagram**
3. Edit Style → เพิ่ม:
   ```
   edgeStyle=orthogonalEdgeStyle;rounded=0;curved=0;
   ```
4. เส้นที่ลากใหม่จะเป็น orthogonal ทันที

### 4.3 ลูกศร

- ใช้ **ลูกศรเดียว** (`-->`) เป็นค่าเริ่มต้น
- ไม่ต้องใช้ลูกศรสองทาง `<-->` เว้นแต่จะระบุ Bidirectional ชัดเจน
- ลูกศรชี้จาก **ผู้ส่งคำขอ** ไปยัง **ผู้รับคำขอ**

---

## 5. กฎสี (Optional — ใส่หรือไม่ก็ได้)

### 5.1 หลักการ

- **ไม่ต้องใส่สีใน Mermaid Code** (`classDef` + `class`) — draw.io ตอน Import ไม่อ่าน
- **ใส่สีใน draw.io ตอนปรับ** (ถ้าต้องการ)

### 5.2 ถ้าใส่สี — ใช้ Palette นี้

| Layer | สี Fill | สี Stroke |
|-------|---------|-----------|
| Layer 1 — Users | ฟ้าอ่อน `#dbeafe` | `#1e40af` |
| Layer 2 — Gateway | เหลืองอ่อน `#fef3c7` | `#a16207` |
| Layer 3 — Backend | ส้มอ่อน `#fed7aa` | `#c2410c` |
| Layer 4 — Storage | แดงอ่อน `#fecaca` | `#991b1b` |
| Layer 5 — External | ม่วงอ่อน `#e9d5ff` | `#6b21a8` |

**วิธีตั้งสีใน draw.io**:
- คลิก node → Right Sidebar → **Fill Color** + **Line Color**

---

## 6. กฎรูปทรงพิเศษ (Node Shapes)

### 6.1 Shape ตามประเภท

| ประเภท | Mermaid Syntax | Shape |
|--------|-----------------|-------|
| **กล่องทั่วไป** | `["..."]` | สี่เหลี่ยมมุมตรง |
| **Database** | `[("..."")]` | ทรงกระบอก (Cylinder) |
| **Decision** (Flowchart) | `{"..."}` | สี่เหลี่ยมข้าวหลามตัด |
| **Start/End** | `(("..."))` | วงกลม / Stadium |
| **Process** (Flowchart) | `["..."]` | สี่เหลี่ยมมุมตรง |

### 6.2 ตัวอย่างใน RBMS-POS

```mermaid
SQL[("SQL Server :1433")]     %% Cylinder — Database
MinIO[("MinIO :9000")]        %% Cylinder — Storage
API["REST API"]               %% Rectangle — Process
Decision{"ผู้ใช้ login?"}      %% Diamond — Decision (Flowchart)
Start(["เริ่มต้น"])            %% Stadium — Start
```

---

## 7. กฎการ Export

### 7.1 PNG สำหรับรายงาน Word/PDF

**Settings**:
- **Zoom**: 200% (ภาพคมชัด ไม่เบลอตอน print)
- **Border**: 10 px
- **Transparent Background**: ✅ ติ๊ก (พื้นโปร่งใส วางในเอกสารแล้วสีพื้นเอกสารโชว์ผ่าน)
- **Selection Only**: ❌ ไม่ติ๊ก (Export ทั้ง Diagram)

**File Naming**:
- รูปแบบ: `figure-{เลขบท}-{เลขรูป}-{ชื่อสั้น}.png`
- ตัวอย่าง: `figure-3-1-system-architecture.png`

### 7.2 .drawio (Source File)

เก็บไว้ใน:
- โฟลเดอร์: `doc/diagrams/` (สร้างเอง)
- หรือ Google Drive ส่วนตัว

**File Naming**:
- รูปแบบ: `chapter-{เลขบท}-{เลขรูป}-{ชื่อสั้น}.drawio`
- ตัวอย่าง: `chapter-3-1-system-architecture.drawio`

---

## 8. รายการ Diagram ที่ต้องทำในรายงาน

| ลำดับ | บท | หัวข้อ | Diagram | สถานะ |
|-------|-----|---------|---------|--------|
| 1 | 1 | 1.6 ขั้นตอนการดำเนินงาน | Flowchart 5 ขั้น | ⏳ รอ |
| 2 | 3 | 3.1 สถาปัตยกรรมระบบ | System Architecture | ✅ เสร็จ |
| 3 | 3 | 3.3.1-3.3.10 Flowchart | 10 Flowcharts | ⏳ รอ |
| 4 | 3 | 3.5 ER Diagram | ER Diagram | ⏳ รอ |

---

## 9. Checklist ก่อนใส่ Diagram ในรายงาน

- [ ] **โครงสร้าง**: แนวตั้ง (Top-Bottom) เป็นหลัก
- [ ] **เส้น**: orthogonal (มุมฉาก) ไม่โค้ง
- [ ] **ลูกศร**: ทิศทางชัดเจน (ลูกศรชี้จากต้นทาง → ปลายทาง)
- [ ] **Label**: สั้น กระชับ
- [ ] **กล่อง**: ขนาดเท่ากันหรือใกล้เคียง (ไม่มีกล่องเล็ก-ใหญ่ผิดสัดส่วน)
- [ ] **Spacing**: ระยะห่างระหว่างกล่องสม่ำเสมอ
- [ ] **Font**: ภาษาอังกฤษ (เพื่อหลีกเลี่ยงปัญหา font ตอน Export)
- [ ] **PNG**: zoom 200% + transparent background
- [ ] **Caption**: ใส่ "รูปที่ X.Y ชื่อรูป" ใต้ภาพในรายงาน
- [ ] **.drawio**: บันทึกไฟล์ต้นฉบับไว้สำหรับแก้ภายหลัง

---

## 10. ตัวอย่างที่ดี (Reference)

**System Architecture ของ RBMS-POS** (ภาพที่ผู้จัดทำสร้างเมื่อ 2026-05-31):
- 5 Layer แนวตั้ง
- Layer 1: 2 กล่อง TB (Admin บน / Customer ล่าง)
- Layer 2: 1 กล่อง (Nginx รวม Certbot)
- Layer 3: 2×2 grid (4 modules)
- Layer 4: 2 กล่อง LR (SQL + MinIO)
- Layer 5: 2 กล่อง LR (Gmail + reCAPTCHA)
- เส้น orthogonal ทั้งหมด
- Label บนเส้น: HTTPS, /api + /hubs, EF Core + S3 API

ใช้เป็น **Template** สำหรับ Diagram อื่นๆ ในรายงาน

---

## 11. การแก้ปัญหาที่พบบ่อย

| ปัญหา | สาเหตุ | วิธีแก้ |
|--------|--------|---------|
| เส้นโค้งหลัง Import Mermaid | draw.io ไม่อ่าน `curve: linear` ใน Mermaid init | คลิกเส้น → Ctrl+E → ตั้ง `edgeStyle=orthogonalEdgeStyle;curved=0;` |
| กล่องวางตำแหน่งผิด | Mermaid render order ต่างจาก draw.io | ลากกล่องด้วยตัวเองใน draw.io หลัง import |
| ภาษาไทยใน node แสดงผิด | Font ไม่ support | ใช้ภาษาอังกฤษใน Diagram (อธิบายเป็นภาษาไทยในย่อหน้าใต้รูป) |
| Mermaid Code ใน draw.io ไม่ Import ผ่าน Extras → Edit Diagram | ช่องนั้นรับแค่ XML | ใช้ **Insert (+) → Advanced → Mermaid** แทน |
| ขนาดกล่องไม่เท่ากัน | Auto-layout ของ Mermaid | คลิกเลือกหลายกล่อง → คลิกขวา → "Same Size" |
