# บทคัดย่อ + กิตติกรรมประกาศ

> เนื้อหาพร้อมใช้ — ส่วน `[ระบุ...]` ให้ผู้จัดทำกรอกเองตอน Export ไปไฟล์ Word

---

## ข้อมูลหัวเรื่อง (ส่วน Header ของบทคัดย่อ)

| รายการ | รายละเอียด |
|--------|------------|
| หัวข้อปริญญานิพนธ์ | ระบบบริหารธุรกิจร้านอาหารผ่านเว็บพร้อมระบบ POS |
| ชื่อนักศึกษา | [ระบุชื่อ-นามสกุล] รหัสนักศึกษา [ระบุรหัส] |
|  | [ระบุชื่อ-นามสกุล] รหัสนักศึกษา [ระบุรหัส] |
| อาจารย์ที่ปรึกษา | [ระบุคำนำหน้า ชื่อ-นามสกุล อาจารย์ที่ปรึกษา] |
| หลักสูตร | วิศวกรรมศาสตรบัณฑิต |
| สาขาวิชา | วิศวกรรมคอมพิวเตอร์ |
| ปีการศึกษา | [ระบุปีการศึกษา] |

---

## บทคัดย่อ

ปริญญานิพนธ์ฉบับนี้ขอนำเสนอระบบบริหารธุรกิจร้านอาหารผ่านเว็บพร้อมระบบ POS ซึ่งเป็นรูปแบบเว็บแอปพลิเคชัน ระบบนี้แบ่งผู้ใช้งานออกเป็น 3 กลุ่มที่สำคัญ คือ ลูกค้า พนักงาน และผู้ดูแลระบบ โดยที่ระบบนี้ครอบคลุมทั้งหมด 8 โมดูลธุรกิจหลัก ได้แก่ การควบคุมสิทธิ์ ผู้ดูแลระบบ ทรัพยากรบุคคล เมนูอาหาร โต๊ะอาหาร ออเดอร์ การชำระเงิน และการแจ้งเตือน

ผู้ใช้งานกลุ่มแรกคือลูกค้า ซึ่งใช้งานผ่านเว็บแอปพลิเคชันบนอุปกรณ์พกพา (Mobile Web) บุคคลกลุ่มนี้มีสิทธิ์สแกนคิวอาร์โค้ดและเข้าสู่หน้าสั่งอาหาร ดูเมนูและเลือกรายการอาหาร ส่งออเดอร์และติดตามสถานะ เรียกพนักงาน ขอชำระเงิน และอัปโหลดสลิปการโอนเงิน (โมดูลเมนูอาหาร โต๊ะอาหาร ออเดอร์ และการชำระเงิน) ผู้ใช้งานกลุ่มที่สองคือพนักงาน ซึ่งมีความสามารถในการเข้าสู่ระบบและจัดการเซสชันการทำงาน การรับและจัดการออเดอร์ การจัดการการทำอาหารในห้องครัว การจัดการโต๊ะและการจอง การรับชำระเงินและตรวจสอบสลิป การแยกใบเสร็จและออกใบเสร็จ ตลอดจนการดูการแจ้งเตือนแบบเวลาจริง (โมดูลทรัพยากรบุคคล เมนูอาหาร โต๊ะอาหาร ออเดอร์ การชำระเงิน และการแจ้งเตือน) ผู้ใช้งานกลุ่มสุดท้ายคือผู้ดูแลระบบ ซึ่งสามารถเข้าถึงโมดูลธุรกิจหลักได้ครบทุกโมดูล

ระบบนี้ได้รับการพัฒนาด้วย ASP.NET Core 9.0 ร่วมกับเฟรมเวิร์ก Angular 19.1 และเทคโนโลยี SignalR สำหรับการสื่อสารข้อมูลแบบเวลาจริง (Real-time) โดยข้อมูลทั้งหมดถูกจัดเก็บไว้ในฐานข้อมูล SQL Server และระบบจัดเก็บไฟล์ MinIO จุดเด่นของระบบนี้คือ การสั่งอาหารด้วยตนเองผ่านคิวอาร์โค้ด (QR Code Self-Ordering) การสื่อสารแบบเวลาจริงระหว่างหน้าร้าน ครัว และลูกค้า การตรวจสอบสลิปอัตโนมัติด้วยการรู้และจำตัวอักษรด้วยภาพ (Optical Character Recognition: OCR) และการควบคุมการเข้าถึงตามบทบาท (Role-Based Access Control: RBAC) ผ่านเมทริกซ์สิทธิ์ที่เจ้าของร้านสามารถปรับแต่งได้โดยไม่ต้องแก้ไขรหัสคำสั่ง

ผลการทดสอบระบบครบทุกโมดูลธุรกิจพบว่า ความสามารถของแต่ละโมดูล รวมถึงความสามารถของผู้ใช้งานแต่ละกลุ่ม สามารถทำงานได้อย่างครบถ้วนและสมบูรณ์ตามที่ได้มุ่งหวังไว้

**คำสำคัญ**: ระบบบริหารจัดการร้านอาหาร, ระบบขายหน้าร้าน, การสั่งอาหารด้วยตนเองผ่านคิวอาร์โค้ด, การสื่อสารแบบเวลาจริง, การรู้และจำตัวอักษรด้วยภาพ, ระบบควบคุมการเข้าถึงตามบทบาท

---

## Abstract

| Field | Detail |
|-------|--------|
| Project Title | Restaurant Business Web Management System with POS |
| Student | Mr./Ms. [Name] Student ID [ID] |
|  | Mr./Ms. [Name] Student ID [ID] |
| Advisor | [Advisor Name] |
| Degree | Bachelor of Engineering |
| Program in | Computer Engineering |
| Academic Year | [Year] |

This thesis presents the Restaurant Business Web Management System with POS, developed in the form of a web application that encompasses eight core business modules, namely Permission Control, System Administration, Human Resources, Menu, Table, Order, Payment, and Notification. The system classifies its users into three principal groups. The first group consists of customers, who access the system through a mobile web application to scan QR codes, browse menus and select food items, submit orders and track their status, call staff, request payment, and upload payment slips. The second group consists of staff, who are able to log in and manage their work sessions, receive and manage orders, manage food preparation in the kitchen, manage tables and reservations, receive payments and verify slips, split bills and issue receipts, as well as view real-time notifications. The final group consists of system administrators, who have full access to all core business modules.

The system has been developed with ASP.NET Core 9.0 together with the Angular 19.1 framework and SignalR technology for real-time data communication, while all data is stored in the SQL Server database and the MinIO object storage system. The distinctive features of this system are QR Code Self-Ordering, real-time communication between the front-of-house, the kitchen, and customers, automatic payment slip verification using Optical Character Recognition (OCR), and Role-Based Access Control (RBAC) implemented through a permission matrix that restaurant owners can configure without modifying the source code. The testing results across all business modules indicate that the capabilities of each module, together with the capabilities of each user group, operate completely and properly as originally intended.

**Keywords**: Restaurant Management System, Point of Sale, QR Code Self-Ordering, Real-time Communication, Optical Character Recognition, Role-Based Access Control

---

## กิตติกรรมประกาศ

ปริญญานิพนธ์หัวข้อ "ระบบบริหารธุรกิจร้านอาหารผ่านเว็บพร้อมระบบ POS" ฉบับนี้ สำเร็จลุล่วงไปได้ด้วยดีจากความกรุณาและการสนับสนุนของบุคคลหลายท่าน คณะผู้จัดทำจึงขอแสดงความขอบคุณเป็นอย่างยิ่งไว้ ณ โอกาสนี้

ขอกราบขอบพระคุณ [ระบุคำนำหน้า ชื่อ-นามสกุล] อาจารย์ที่ปรึกษาปริญญานิพนธ์ ที่ได้สละเวลาอันมีค่าในการให้คำปรึกษา ชี้แนะแนวทาง ตลอดจนตรวจทานและแก้ไขข้อบกพร่องต่าง ๆ ด้วยความเอาใจใส่มาโดยตลอด คณะผู้จัดทำรู้สึกซาบซึ้งในความเมตตาของท่านเป็นอย่างยิ่ง

ขอขอบพระคุณคณาจารย์ทุกท่านที่ได้ประสิทธิ์ประสาทวิชาความรู้และทักษะทางวิชาการ ตลอดจนรุ่นพี่และเพื่อน ๆ ที่คอยให้คำปรึกษาและร่วมกันแก้ไขปัญหาต่าง ๆ จนโครงงานสำเร็จลุล่วงไปได้ด้วยดี

ท้ายที่สุดนี้ ขอกราบขอบพระคุณบิดา มารดา และครอบครัว ซึ่งเป็นเบื้องหลังความสำเร็จที่สำคัญที่สุด ที่คอยอบรมสั่งสอน เลี้ยงดู และสนับสนุนการศึกษาของผู้จัดทำอย่างเต็มที่เสมอมา

คุณค่าและประโยชน์อันพึงมีจากปริญญานิพนธ์ฉบับนี้ คณะผู้จัดทำขอมอบแด่บิดา มารดา คณาจารย์ ตลอดจนผู้มีพระคุณทุกท่านที่ได้กล่าวมาข้างต้น

[ระบุชื่อนักศึกษาคนที่ 1]
[ระบุชื่อนักศึกษาคนที่ 2]
ผู้จัดทำ
