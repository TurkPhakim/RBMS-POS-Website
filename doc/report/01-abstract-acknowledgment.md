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

ธุรกิจร้านอาหารในยุคปัจจุบันต้องการเครื่องมือบริหารที่ครอบคลุมและรวดเร็ว แต่ระบบขายหน้าร้าน (Point of Sale) ที่ใช้งานในร้านอาหารโดยทั่วไปยังคงประสบปัญหาด้านความล่าช้าในการรับออเดอร์ การจดรายการอาหารผ่านกระดาษซึ่งทำให้ครัวอ่านยากและตกหล่น การตรวจสอบสลิปโอนเงินด้วยตาเปล่าซึ่งใช้เวลามากและผิดพลาดง่าย ตลอดจนการแยกบิลของลูกค้ากลุ่มที่มีการคำนวณซับซ้อน ส่งผลให้การบริการเป็นไปอย่างไม่ราบรื่นและสร้างความสับสนทั้งฝ่ายพนักงานและลูกค้า

ด้วยเหตุผลนี้ คณะผู้จัดทำจึงได้พัฒนา "ระบบบริหารธุรกิจร้านอาหารผ่านเว็บพร้อมระบบ POS (Restaurant Business Web Management System with POS)" ในรูปแบบเว็บแอปพลิเคชันแบบโอเพนซอร์ส (Open Source) ครอบคลุมขอบเขตการดำเนินงานทั้งหมด 8 โมดูลธุรกิจ (Business Module) แบ่งการใช้งานเป็นสองส่วน ได้แก่ ส่วนสำหรับพนักงานในร้าน (Admin Client) และส่วนสำหรับลูกค้าผ่านมือถือ (Mobile Web) พัฒนาด้วยเทคโนโลยี ASP.NET Core 9.0, Entity Framework Core 9, SignalR, Angular 19.1, Tailwind CSS, PrimeNG, SQL Server และ MinIO เป็นที่จัดเก็บไฟล์ โดยมีระบบเด่น ได้แก่ การสั่งอาหารด้วยตนเองผ่านคิวอาร์โค้ด (QR Code Self-Ordering) การสื่อสารแบบเวลาจริง (Real-time Communication) ระหว่างหน้าร้าน ครัว และลูกค้า การตรวจสอบสลิปโอนเงินอัตโนมัติด้วยระบบรู้จำตัวอักษรด้วยภาพ (Optical Character Recognition: OCR) และระบบควบคุมการเข้าถึงตามบทบาทแบบไดนามิก (Role-Based Access Control: RBAC) ผ่านเมทริกซ์สิทธิ์การเข้าถึง (Permission Matrix) ที่เจ้าของร้านสามารถปรับแต่งได้เองโดยไม่ต้องแก้รหัสคำสั่ง

จากการทดสอบพบว่าระบบสามารถส่งข้อมูลออเดอร์ระหว่างหน้าร้านและครัวแบบเวลาจริง (Real-time) ระบบตรวจสอบสลิปสามารถอ่านยอดเงินและเปรียบเทียบกับยอดบิลโดยอัตโนมัติ พร้อมรองรับการตรวจสอบด้วยตนเองในกรณีที่ภาพไม่ชัดเจน และระบบสิทธิ์การเข้าถึงสามารถปรับเปลี่ยนตามตำแหน่งงานของแต่ละร้านได้อย่างยืดหยุ่น นอกจากนี้ ระบบยังออกแบบให้รองรับร้านอาหารหลากหลายประเภท ทั้งร้านอาหารตามสั่ง ร้านอาหารญี่ปุ่นและเกาหลีแบบบุฟเฟ่ต์ ร้านชาบูและสุกี้ ตลอดจนร้านกาแฟและคาเฟ่ ส่งผลให้เจ้าของร้านสามารถบริหารร้านได้อย่างเป็นระบบและมีประสิทธิภาพมากยิ่งขึ้น พนักงานและลูกค้าใช้งานได้สะดวก และช่วยลดความผิดพลาดของการสื่อสารระหว่างหน้าร้านและครัวลงอย่างมีนัยสำคัญ

**คำสำคัญ**: ระบบบริหารจัดการร้านอาหาร, ระบบขายหน้าร้าน, การสั่งอาหารด้วยตนเองผ่านคิวอาร์โค้ด, การสื่อสารแบบเวลาจริง, การรู้จำตัวอักษรด้วยภาพ, ระบบควบคุมการเข้าถึงตามบทบาท

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

The restaurant business in the present era requires comprehensive and responsive management tools. However, conventional Point of Sale (POS) systems used in restaurants still face several challenges, including delays in order taking, paper-based order tickets that are often illegible or lost in transit to the kitchen, slow and error-prone manual slip verification, and complex bill-splitting calculations for group customers. These issues result in inefficient service and confusion among both staff and customers.

For these reasons, the project team has developed the "Restaurant Business Web Management System with POS (RBMS-POS)" as an open-source web application, covering eight business modules and divided into two parts: an Admin Client for in-restaurant staff and a Mobile Web for customers. The system is implemented using ASP.NET Core 9.0, Entity Framework Core 9, SignalR, Angular 19.1, Tailwind CSS, PrimeNG, SQL Server, and MinIO as object storage. Key innovations include QR Code Self-Ordering, real-time communication between front-of-house, kitchen, and customers, automatic payment slip verification using Optical Character Recognition (OCR), and Dynamic Role-Based Access Control (RBAC) through a configurable Permission Matrix that restaurant owners can adjust without modifying source code.

Testing results indicate that the system can deliver order data between front-of-house and kitchen in real time, the slip verification module can read transaction amounts and compare them with the bill total automatically while also supporting manual verification when the image is unclear, and access permissions can be flexibly adjusted to match each restaurant's organizational structure. Furthermore, the system is designed to accommodate various restaurant types, including à la carte restaurants, Japanese and Korean buffets, Shabu and Sukiyaki restaurants, as well as coffee shops and cafés. As a result, restaurant owners can manage their operations more systematically and efficiently, staff and customers find the system convenient to use, and miscommunication between front-of-house and kitchen is significantly reduced.

**Keywords**: Restaurant Management System, Point of Sale, QR Code Self-Ordering, SignalR, Real-time Communication, Role-Based Access Control, OCR Slip Verification

---

## กิตติกรรมประกาศ

ปริญญานิพนธ์หัวข้อ "ระบบบริหารธุรกิจร้านอาหารผ่านเว็บพร้อมระบบ POS" ฉบับนี้ สำเร็จลุล่วงไปได้ด้วยดีจากความกรุณาและการสนับสนุนของบุคคลหลายท่าน คณะผู้จัดทำจึงขอแสดงความขอบคุณเป็นอย่างยิ่งไว้ ณ โอกาสนี้

ขอกราบขอบพระคุณ [ระบุคำนำหน้า ชื่อ-นามสกุล] อาจารย์ที่ปรึกษาปริญญานิพนธ์ ที่ได้สละเวลาอันมีค่าในการให้คำปรึกษา ชี้แนะแนวทาง ตลอดจนตรวจทานและแก้ไขข้อบกพร่องต่าง ๆ ด้วยความเอาใจใส่มาโดยตลอด คณะผู้จัดทำรู้สึกซาบซึ้งในความเมตตาของท่าน และขอกราบขอบพระคุณเป็นอย่างสูงมา ณ ที่นี้

ขอกราบขอบพระคุณคณาจารย์ทุกท่าน ที่ได้ประสิทธิ์ประสาทวิชาความรู้ มอบประสบการณ์ ทักษะทางวิชาการ ตลอดจนให้ความเอาใจใส่และคอยช่วยเหลือคณะผู้จัดทำเสมอมา

ขอขอบคุณรุ่นพี่และเพื่อน ๆ ทุกคน ที่คอยเป็นที่ปรึกษา ให้ความช่วยเหลือ และร่วมกันแก้ไขปัญหาต่าง ๆ ในการทำโครงงานชิ้นนี้จนสำเร็จลุล่วงไปได้ด้วยดี

ท้ายที่สุดนี้ ขอกราบขอบพระคุณบิดา มารดา และครอบครัว ซึ่งเป็นเบื้องหลังความสำเร็จที่สำคัญที่สุด ที่คอยอบรมสั่งสอน เลี้ยงดู มอบความรัก ความเข้าใจ และสนับสนุนการศึกษาของผู้จัดทำอย่างเต็มที่เสมอมา จนกระทั่งประสบความสำเร็จในการศึกษา

คุณค่าและประโยชน์อันพึงมีจากปริญญานิพนธ์ฉบับนี้ คณะผู้จัดทำขอมอบแด่บิดา มารดา คณาจารย์ ตลอดจนผู้มีพระคุณทุกท่านที่ได้กล่าวมาข้างต้น

[ระบุชื่อนักศึกษาคนที่ 1]
[ระบุชื่อนักศึกษาคนที่ 2]
ผู้จัดทำ
