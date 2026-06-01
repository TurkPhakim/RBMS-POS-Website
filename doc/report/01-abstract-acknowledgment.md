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

ธุรกิจร้านอาหารในปัจจุบันยังประสบปัญหาด้านการบริหารงานหน้าร้าน ทั้งการรับออร์เดอร์ที่ล่าช้า การจดรายการผ่านกระดาษที่อ่านยากและตกหล่น การตรวจสอบสลิปโอนเงินด้วยตาเปล่าที่ใช้เวลามากและผิดพลาดง่าย ตลอดจนการแยกบิลที่มีการคำนวณซับซ้อน ส่งผลให้การบริการเป็นไปอย่างไม่ราบรื่น

คณะผู้จัดทำจึงได้พัฒนา "ระบบบริหารธุรกิจร้านอาหารผ่านเว็บพร้อมระบบ POS (Restaurant Business Web Management System with POS)" ในรูปแบบเว็บแอปพลิเคชันแบบโอเพนซอร์ส (Open Source) ครอบคลุม 8 โมดูลธุรกิจ แบ่งเป็นส่วนสำหรับพนักงาน (Admin Client) และส่วนสำหรับลูกค้าผ่านมือถือ (Mobile Web) พัฒนาด้วย ASP.NET Core 9.0, Angular 19.1, SignalR, SQL Server และ MinIO

มีจุดเด่นคือ การสั่งอาหารด้วยตนเองผ่านคิวอาร์โค้ด (QR Code Self-Ordering) การสื่อสารแบบเวลาจริง (Real-time) ระหว่างหน้าร้าน ครัว และลูกค้า การตรวจสอบสลิปอัตโนมัติด้วยการรู้และจำตัวอักษรด้วยภาพ (Optical Character Recognition: OCR) และการควบคุมการเข้าถึงตามบทบาท (Role-Based Access Control: RBAC) ผ่านเมทริกซ์สิทธิ์ที่เจ้าของร้านปรับแต่งได้โดยไม่ต้องแก้รหัสคำสั่ง

ผลการทดสอบพบว่าระบบสามารถส่งข้อมูลออร์เดอร์แบบเวลาจริงระหว่างหน้าร้านและครัว อ่านยอดเงินจากสลิปและเปรียบเทียบกับยอดบิลได้โดยอัตโนมัติพร้อมรองรับการตรวจสอบด้วยตนเองเมื่อภาพไม่ชัด และปรับสิทธิ์การเข้าถึงตามตำแหน่งงานของแต่ละร้านได้อย่างยืดหยุ่น โดยรองรับร้านอาหารหลากหลายประเภท ทั้งร้านอาหารตามสั่ง ร้านบุฟเฟ่ต์ ร้านกาแฟและคาเฟ่ ช่วยให้เจ้าของร้านบริหารงานได้อย่างเป็นระบบ และลดความผิดพลาดของการสื่อสารระหว่างหน้าร้านและครัวลงอย่างมีนัยสำคัญ

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

Contemporary restaurant businesses still face several front-of-house management challenges, including delays in order taking, handwritten paper order tickets that are often illegible and prone to missed items, slow and error-prone manual payment slip verification, and complex bill-splitting calculations — all of which result in inefficient service.

The project team has therefore developed the "Restaurant Business Web Management System with POS" as an open-source web application covering eight business modules, divided into an Admin Client for staff and a Mobile Web for customers. The system is implemented using ASP.NET Core 9.0, Angular 19.1, SignalR, SQL Server, and MinIO.

Key features of the system include QR Code Self-Ordering, real-time communication between the front-of-house, kitchen, and customers, automatic payment slip verification using Optical Character Recognition (OCR), and Role-Based Access Control (RBAC) through a configurable Permission Matrix that restaurant owners can adjust without modifying source code.

Testing results show that the system can transmit order data between the front-of-house and the kitchen in real time, automatically read slip amounts and compare them with the bill total while supporting manual verification when images are unclear, and flexibly adjust access permissions according to the staff positions of each restaurant. The system supports a variety of restaurant types, including à la carte restaurants, buffet restaurants, and coffee shops and cafés, enabling owners to manage their operations more systematically and significantly reducing miscommunication between the front-of-house and the kitchen.

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
