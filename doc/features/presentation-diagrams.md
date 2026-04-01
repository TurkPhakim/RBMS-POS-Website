# Prompt สร้าง Diagram + บทพูดประกอบ (Presentation)

> แยกจาก presentation-content.md — รวม Prompt สำหรับ Gemini Gen รูป + บทพูดประกอบแต่ละ Diagram

---

## Prompt สำหรับ Gen รูป Diagram (ใช้กับ Gemini)

### Prompt 1: System Architecture Diagram (ภาพรวมทั้งระบบ) — ปรับปรุงแล้ว

```
Create a professional system architecture diagram for a Restaurant POS system called "RBMS-POS". Use a clean, modern, flat design style with a white background suitable for a presentation slide (16:9 aspect ratio).

Title at top: "RBMS-POS — System Architecture"

Layout: Top-to-bottom flow with clear separation into 5 horizontal layers.

═══════════════════════════════════════════════════
LAYER 1 — Users (top)
═══════════════════════════════════════════════════
- Left side: An icon of a person at a desktop computer, labeled "Admin / Staff" with subtitle "Client Web (Angular 19)" and "Port 4300". Use a blue color theme (#3B82F6).
  Below the box, show 3 small tags: "Dashboard" "Order & Kitchen" "Management"
- Right side: An icon of a person holding a smartphone, labeled "Customer" with subtitle "Mobile Web (Angular 19)" and "Port 4400". Use a green color theme (#10B981).
  Below the box, show 3 small tags: "QR Ordering" "Track Status" "Payment"
- Both send solid arrows downward labeled "HTTPS (REST API)".
- IMPORTANT: Both also have dashed arrows coming back UP from the Backend's SignalR component (see Layer 3). The left dashed arrow is labeled "Real-time: Kitchen, Notification" and the right dashed arrow is labeled "Real-time: Order Status, Payment".

═══════════════════════════════════════════════════
LAYER 2 — Gateway
═══════════════════════════════════════════════════
- A single wide rounded rectangle in the center, labeled "Nginx (Reverse Proxy + Load Balancer)" with subtitle "Port 80 (HTTP) → 443 (HTTPS)". Use a dark gray color (#1E293B) with white text.
- To the right of Nginx, a small badge labeled "Certbot" with a lock icon and text "Let's Encrypt SSL Auto-Renew". Connected to Nginx with a small arrow labeled "certificates".
- Arrow from Nginx going down to Backend, labeled with route mapping:
  "/api/* → Backend"
  "/hub/* → SignalR"

═══════════════════════════════════════════════════
LAYER 3 — Backend (the largest section)
═══════════════════════════════════════════════════
- A large rounded rectangle in the center, labeled "Backend API" with subtitle "ASP.NET Core 9.0 — Port 5300". Use an orange color theme (#F97316) border.

- Inside the Backend box, arrange components in 2 rows:

  ROW 1 (top, 4 boxes side by side):
  1. "REST API" subtitle: "24 Controllers, 215 Endpoints"
  2. "SignalR Hubs" subtitle: "OrderHub + NotificationHub" (this is where the dashed arrows originate going back UP to Layer 1)
  3. "Business Logic" subtitle: "8 Service Modules"
  4. "JWT Auth + RBAC" subtitle: "Position-based Permissions"

  ROW 2 (bottom, 3 boxes side by side):
  5. "Slip OCR" subtitle: "QR Reader + Amount Verify"
  6. "Background Jobs" subtitle: "Auto-Cleanup, Reservation Reminder"
  7. "Email Service" subtitle: "MailKit SMTP (OTP, Password Reset)"

- From "Email Service", draw an arrow going RIGHT outside the Docker border to an external cloud icon labeled "Gmail SMTP" with envelope icon.

═══════════════════════════════════════════════════
LAYER 4 — Data Storage
═══════════════════════════════════════════════════
- Left: A cylinder (database icon) labeled "SQL Server 2022" with subtitle "Port 1433". Use a blue color (#3B82F6).
  Below it, show grouped data: "37 Tables: Orders, Menus, Tables, Employees, Payments, Permissions, Notifications"
  Below that: a small volume icon labeled "sqlserver-data (Docker Volume)"

- Right: A bucket/storage icon labeled "MinIO (S3-Compatible Storage)" with subtitle "Port 9000". Use a pink/red color (#F43F5E).
  Below it, show stored file types: "Menu Images, Profile Photos, Shop Logo, Payment QR, Slip Images, Receipts"
  Below that: a small volume icon labeled "minio-data (Docker Volume)"

- Solid arrows from Backend going down to both SQL Server (labeled "EF Core ORM") and MinIO (labeled "S3 API (AWSSDK)").

═══════════════════════════════════════════════════
LAYER 5 — External Services (outside Docker border, far right)
═══════════════════════════════════════════════════
- Small cloud icon: "Gmail SMTP" (connected from Email Service)
- Small cloud icon: "Google reCAPTCHA v3" (connected from JWT Auth with dashed line labeled "Bot Protection")
- These sit OUTSIDE the Docker border on the right side.

═══════════════════════════════════════════════════
OUTER BORDER
═══════════════════════════════════════════════════
- A large dashed blue border wrapping Layer 1 through Layer 4 (NOT the external services).
- Label at the bottom-center: "Docker Compose" with a Docker whale icon.
- Small subtitle: "Single command deployment: docker compose up -d"
- Bottom-left corner: small network icon labeled "rbms-pos-network (Bridge)"

═══════════════════════════════════════════════════
LEGEND (bottom of diagram)
═══════════════════════════════════════════════════
- Solid arrow: "HTTP/HTTPS Request (REST API)"
- Dashed arrow: "Real-time Push (WebSocket / SignalR)"
- Cylinder: "Database"
- Bucket: "Object Storage"

═══════════════════════════════════════════════════
STYLE REQUIREMENTS
═══════════════════════════════════════════════════
- Flat design, no 3D effects, no heavy gradients (subtle gradient OK)
- Rounded corners (12px radius) on all boxes
- Arrows: clean, with clear arrowheads. Solid for HTTP, dashed for WebSocket.
- Consistent outlined icon style throughout
- Font: clean sans-serif (Inter, Segoe UI, or similar)
- Color palette:
  - Blue (#3B82F6) — Client Web, SQL Server
  - Orange (#F97316) — Backend API
  - Green (#10B981) — Mobile Web
  - Dark Gray (#1E293B) — Nginx
  - Pink/Red (#F43F5E) — MinIO
  - Light Gray (#F8FAFC) — background fills inside boxes
- White background overall
- 16:9 aspect ratio
- All text must be clearly readable at presentation size (minimum ~12pt equivalent)
- All text in English
- Professional quality suitable for a university project presentation or investor pitch
```

### Prompt 2: Data Flow Diagram (ลูกค้าสั่งอาหาร → ครัว → ชำระเงิน) — ปรับปรุงแล้ว

```
Create a professional data flow diagram showing the complete restaurant ordering process for a POS system called "RBMS-POS". Use a clean, modern infographic style with a white background for a presentation slide (16:9 aspect ratio).

Title at top: "Complete Restaurant Ordering Flow"

The flow is arranged in 2 ROWS to fit all 8 steps clearly:

ROW 1 (top row, steps 1-4, left to right):

STEP 1 — "Scan QR Code" (green background — Customer action)
- Icon: A smartphone scanning a QR code on a restaurant table
- Label: "Customer scans QR at table → Get session token"
- Arrow going right to Step 2

STEP 2 — "Browse & Order" (green background — Customer action)
- Icon: A smartphone showing a food menu grid with a cart icon
- Label: "Browse menu by category → Select options → Add to cart → Place order"
- Small note below: "via Nginx → Backend API → SQL Server"
- Arrow going right to Step 3

STEP 3 — "Kitchen Display" (orange background — System processing)
- Icon: A large monitor/screen showing order tickets in a grid
- Label: "Order appears instantly on Kitchen Display"
- Badge: "Real-time via SignalR" with a lightning bolt icon
- Sub-flow showing 3 status icons in a row: "Pending → Cooking → Ready"
- Arrow going right to Step 4

STEP 4 — "Track Status + Call Waiter" (green background — Customer action)
- Icon: A smartphone showing a progress/status tracker with checkmarks
- Label: "Customer tracks order status in real-time on mobile"
- Second line: "Can call waiter anytime (button with 60s cooldown)"
- Badge: "Live Update" with a refresh/sync icon
- Arrow going DOWN to Step 5 (transition to row 2)

ROW 2 (bottom row, steps 5-8, LEFT to right — same direction):

STEP 5 — "Serve Food" (blue background — Staff action)
- Icon: A waiter carrying a plate of food
- Label: "Staff receives 'Ready to Serve' notification → Delivers food to table"
- Badge: "Real-time Alert"
- Arrow going right to Step 6

STEP 6 — "Request Bill" (green background — Customer action)
- Icon: A smartphone showing a bill/receipt summary with a total amount
- Label: "Customer requests bill → System calculates total + service charge"
- Second line: "Split Bill: Equal split (by person) or Split by item"
- Arrow going right to Step 7

STEP 7 — "Payment" (orange background — System processing)
- Icon: A smartphone showing QR code + a payment slip image
- Label: "Choose payment method:"
- Show 2 sub-paths stacked:
  Path A: "Cash → Cashier calculates change"
  Path B: "QR Transfer → Upload slip → Slip OCR auto-verify amount → Cashier confirms"
- Arrow going right to Step 8

STEP 8 — "Receipt" (green background — Customer action)
- Icon: A PDF document icon with a download arrow
- Label: "Download digital receipt (PDF)"
- Second line: "Per-bill or combined receipt"
- End marker (a checkmark or flag icon)

═══════════════════════════════════════════════════
BOTTOM BAR (below both rows)
═══════════════════════════════════════════════════
A thin horizontal bar spanning the full width, divided into 3 color-coded sections:
- Green section: "Mobile Web (Customer)" — covers Step 1, 2, 4, 6, 8
- Orange section: "Backend API (.NET 9 + SignalR)" — spans ALL steps as the backbone
- Blue section: "Client Web (Staff/Kitchen)" — covers Step 3, 5, 7

═══════════════════════════════════════════════════
STYLE REQUIREMENTS
═══════════════════════════════════════════════════
- Clean infographic style with numbered circles (1-8) at the top of each card
- Steps connected by flowing arrows with arrowheads
- Each step is a rounded rectangle card with: colored background, icon, step name (bold), description text
- 2 rows of 4 steps each, with a clear transition arrow from Step 4 down to Step 5
- Color coding:
  - Green (#10B981 light tint) — Customer actions (Step 1, 2, 4, 6, 8)
  - Orange (#F97316 light tint) — System/Backend processing (Step 3, 7)
  - Blue (#3B82F6 light tint) — Staff actions (Step 5)
- White background overall
- Flat design, no 3D, subtle rounded shadows OK
- Font: clean sans-serif
- All text in English
- Text must be readable at presentation size
- Professional quality suitable for a university presentation
```

### Prompt 3: Real-time Communication Diagram (SignalR) — ปรับปรุงแล้ว

```
Create a professional diagram showing real-time communication flow in a Restaurant POS system using SignalR WebSocket. Clean, modern style, white background, 16:9 presentation slide.

Title at top: "Real-time Communication — SignalR WebSocket"

═══════════════════════════════════════════════════
CENTER — SignalR Hub
═══════════════════════════════════════════════════
- A large hexagon labeled "SignalR Hub" with a lightning bolt icon inside. Use orange color (#F97316).
- Subtitle line 1: "Backend API (.NET 9)"
- Subtitle line 2: "OrderHub + NotificationHub"
- Below the hexagon, a small box showing "Notification UI" with 2 items:
  "Toast popup (top-right)" and "Badge counter on bell icon"

═══════════════════════════════════════════════════
4 USER GROUPS around the center (hub-and-spoke layout)
═══════════════════════════════════════════════════

TOP-LEFT — "Kitchen Display" (red/warm color #EF4444):
- Icon: A chef with a large monitor screen
- Group label: "Kitchen Group"
- Arrow FROM center (solid, labeled): "New Order Arrived"
- Arrow TO center (dashed, labeled): "Update Status (Cooking → Ready)"

TOP-RIGHT — "Floor Staff" (blue color #3B82F6):
- Icon: A waiter
- Group label: "Floor Group"
- Arrow FROM center (solid, labeled): "Food Ready to Serve, Customer Calling Waiter"

BOTTOM-LEFT — "Cashier" (green color #10B981):
- Icon: A person at a cash register/computer
- Group label: "Cashier Group"
- Arrow FROM center (solid, labeled): "Bill Requested, Slip Uploaded, Payment Status"
- Arrow TO center (dashed, labeled): "Confirm Payment, Approve/Reject Slip"

BOTTOM-RIGHT — "Customer — Mobile Web" (teal color #14B8A6):
- Icon: A person holding a smartphone
- Group label: "Customer (per-table session)"
- Arrow TO center (dashed, labeled): "Place Order, Request Bill, Upload Slip, Call Waiter"
- Arrow FROM center (solid, labeled): "Order Status Update, Payment Confirmed, Bill Ready"

═══════════════════════════════════════════════════
EVENTS LIST (small card near center or to the side)
═══════════════════════════════════════════════════
Title: "9 Real-time Event Types"
Show as a numbered list:
1. New Order
2. Order Status Changed
3. Food Ready
4. Bill Requested
5. Slip Uploaded
6. Payment Confirmed
7. Customer Calling Waiter
8. Table Moved
9. Table Linked

═══════════════════════════════════════════════════
LEGEND (bottom of diagram)
═══════════════════════════════════════════════════
- Solid arrow (→): "Real-time push via WebSocket (server → client)"
- Dashed arrow (←): "Event trigger via HTTP (client → server → broadcast to groups)"
- Note: "Role-based groups — each role only receives relevant notifications"

═══════════════════════════════════════════════════
STYLE REQUIREMENTS
═══════════════════════════════════════════════════
- Hub-and-spoke layout: hexagon center with 5 groups around it
- Clean arrows with clear arrowheads and labels
- Solid arrows = server push, Dashed arrows = client trigger
- Each group has: distinct color, icon, group name label, connection labels
- Flat design, no 3D effects
- Icons: simple, consistent style (outlined or filled, not mixed)
- Font: clean sans-serif
- Color palette:
  - Orange (#F97316) — SignalR Hub (center)
  - Red (#EF4444) — Kitchen Display
  - Blue (#3B82F6) — Floor Staff
  - Green (#10B981) — Cashier
  - Teal (#14B8A6) — Customer
- White background
- 16:9 aspect ratio
- All text in English
- Professional quality suitable for a university presentation
```

### Prompt 4: Database ER Diagram (ภาพรวม)

```
Create a professional Entity-Relationship overview diagram for a Restaurant POS system called "RBMS-POS". This is a HIGH-LEVEL overview showing table groups and relationships between groups — NOT a detailed column-level ER diagram. White background, 16:9, presentation style.

Title at top: "Database Design — 37 Tables"

═══════════════════════════════════════════════════
LAYOUT — 6 colored groups arranged in a grid
═══════════════════════════════════════════════════
Each group is a large rounded rectangle with a colored header bar. Inside each group, list the table names as simple rows (no columns, just table names).

GROUP 1 — "User & Auth" (blue #3B82F6) — TOP LEFT:
Tables (11):
- TbUsers
- TbEmployees
- TbEmployeeAddresses
- TbEmployeeEducations
- TbEmployeeWorkHistories
- TbPasswordHistories
- TbmPosition
- TbmPermission
- TbmModule
- TbmAuthorizeMatrix
- TbAuthorizeMatrixPosition
Small note: "Position-based RBAC + Employee sub-entities"

GROUP 2 — "Menu" (orange #F97316) — TOP CENTER:
Tables (6):
- TbMenus
- TbMenuSubCategories
- TbOptionGroups
- TbOptionItems
- TbMenuOptionGroups (M:M badge)
- TbServiceCharges
Small note: "3 categories: Food, Beverage, Dessert"

GROUP 3 — "Shop & File" (purple #7C3AED) — TOP RIGHT:
Tables (4):
- TbShopSettings
- TbShopOperatingHours
- TbFiles
- TbRefreshTokens
Small note: "S3 file storage + JWT tokens"

GROUP 4 — "Table & Zone" (green #10B981) — BOTTOM LEFT:
Tables (5):
- TbZones
- TbTables
- TbTableLinks
- TbReservations
- TbFloorObjects
Small note: "Floor plan + Drag & Drop"

GROUP 5 — "Order" (red #EF4444) — BOTTOM CENTER:
Tables (6):
- TbOrders
- TbOrderItems
- TbOrderBills
- TbOrderItemOptions
- TbCustomers
- TbSelfOrderSessions
Small note: "Core business logic"

GROUP 6 — "Payment & Notification" (teal #14B8A6) — BOTTOM RIGHT:
Tables (5):
- TbCashierSessions
- TbCashDrawerTransactions
- TbPayments
- TbNotifications
- TbNotificationReads
Small note: "Cash + QR + Slip OCR"

═══════════════════════════════════════════════════
RELATIONSHIP ARROWS between groups
═══════════════════════════════════════════════════
Draw arrows between groups to show how they connect:

1. "User & Auth" → "Order" (labeled: "CreatedBy / Staff")
2. "User & Auth" → "Payment & Notification" (labeled: "Cashier / Notification Reader")
3. "Menu" → "Order" (labeled: "OrderItems → Menu")
4. "Table & Zone" → "Order" (labeled: "Order → Table")
5. "Order" → "Payment & Notification" (labeled: "Bill → Payment")
6. "Shop & File" → "Menu" (labeled: "Menu Images")
7. "Shop & File" → "User & Auth" (labeled: "Profile Photos")
8. "Shop & File" → "Payment & Notification" (labeled: "Slip Images")

═══════════════════════════════════════════════════
SUMMARY BAR (bottom)
═══════════════════════════════════════════════════
A horizontal bar showing key stats:
"37 Tables | 6 Domain Groups | Soft Delete (BaseEntity) | Audit Trail (CreatedAt/By, UpdatedAt/By)"

═══════════════════════════════════════════════════
LEGEND
═══════════════════════════════════════════════════
- "Tb" prefix = Business table
- "Tbm" prefix = Master Data (seed)
- "(M:M)" badge = Many-to-Many junction table
- Arrow = Foreign Key relationship between groups

═══════════════════════════════════════════════════
STYLE
═══════════════════════════════════════════════════
- Each group is a rounded rectangle with colored header + white body
- Table names listed as simple text rows inside each group (no columns/types)
- Arrows between groups: solid lines with arrowheads, labeled
- Clean, flat design
- Color-coded by domain (each group has a distinct color)
- Font: clean sans-serif
- White background, 16:9
- All text in English
- Professional quality suitable for a university presentation
```

### Prompt 5: Use Case Diagram (Staff vs Customer — Shared Center)

```
Use Case Diagram for "RBMS-POS" Restaurant POS. 16:9, white background, modern flat style.

Title: "Use Case Diagram — Who Can Do What"

═══════════════════════════════════════════════════
LAYOUT — Staff (left) → Shared (center) ← Customer (right)
═══════════════════════════════════════════════════

LEFT — "Staff" as a friendly illustrated male waiter wearing apron, holding a tablet.
Modern flat character illustration (NOT stick figure). Colorful, warm, professional.
Small desktop monitor icon below. Label: "Client Web"

RIGHT — "Customer" as a friendly illustrated female customer in casual clothes,
holding a smartphone. Modern flat character illustration (NOT stick figure).
Small smartphone icon below. Label: "Mobile Web"

═══════════════════════════════════════════════════
CENTER — Use case ovals (SHORT labels, 2-4 words max)
═══════════════════════════════════════════════════

SHARED (both Staff and Customer draw lines to these — lines from BOTH sides):
- "Order Food"
- "Browse Menu"
- "Track Status"
- "Request / Split Bill"
- "Payment"
- "Notifications"

STAFF ONLY (left side, only Staff draws lines):
- "Dashboard & Reports"
- "Manage Menu"
- "Manage Tables"
- "Kitchen Display"
- "Cashier Session"
- "HR & Permissions"
- "Shop Settings"

CUSTOMER ONLY (right side, only Customer draws lines):
- "Scan QR Code"
- "Cart & Customize"
- "Call Waiter"

═══════════════════════════════════════════════════
CONNECTION LINES (important!)
═══════════════════════════════════════════════════
- Staff draws BLUE lines to: all Staff-only ovals AND all Shared ovals
- Customer draws TEAL lines to: all Customer-only ovals AND all Shared ovals
- Shared ovals must have lines coming from BOTH sides (Staff + Customer)

═══════════════════════════════════════════════════
STYLE
═══════════════════════════════════════════════════
- Flat illustration characters — friendly, colorful, realistic proportions (not stick figures)
- Ovals: rounded, soft pastel fills
  - Shared: light purple (#E9D5FF)
  - Staff-only: light blue (#DBEAFE)
  - Customer-only: light green (#D1FAE5)
- Thin color-coded lines (blue = Staff, teal = Customer)
- Minimal text, no descriptions inside ovals
- Bottom note: "Staff permissions are dynamic (Position-based RBAC)"
- Clean sans-serif font, 16:9, English only
```

### Prompt 6: Technology Stack (Logo-based Overview)

```
Create a professional technology stack overview image for a Restaurant POS system called "RBMS-POS".
White background, 16:9 aspect ratio, presentation slide quality.

Title at top center: "RBMS-POS — Technology Stack"

═══════════════════════════════════════════════════
LAYOUT — 6 horizontal rows, each row has a colored label bar on the left and logo cards to the right.
═══════════════════════════════════════════════════

STRICT RULES:
- Exactly 35 items total across 6 rows — do NOT add, remove, or rename any item
- NO hallucinated technologies — only render the items listed below
- NO duplicates — each item appears exactly once
- Technology name in small text below each card
- Each card: light gray (#F8FAFC) rounded-square, same size, even spacing

═══════════════════════════════════════════════════
ROW 1 — "Backend API" (label bar: orange #F97316) — exactly 7 cards
═══════════════════════════════════════════════════
1. ".NET 9" — purple (#512BD4) square, white ".NET" text
2. "ASP.NET Core" — purple badge, white "ASP.NET" text
3. "EF Core" — purple diamond, white "EF" letters
4. "SignalR" — light blue (#0088CE) circle, white curved arrow forming letter "R" inside
5. "JWT" — pink/magenta (#FB015B) circle, white "JWT" text
6. "Swagger" — bright green (#85EA2D) square, black pet icon inside
7. "MailKit" — purple envelope icon

═══════════════════════════════════════════════════
ROW 2 — "Frontend" (label bar: blue #3B82F6) — exactly 8 cards
═══════════════════════════════════════════════════
1. "Angular 19" — red (#DD0031) shield, white "A"
2. "TypeScript" — blue (#3178C6) rounded square, white "TS"
3. "Tailwind CSS" — cyan (#06B6D4) abstract wind shape (two curved lines)
4. "PrimeNG" — golden/orange LION face (PrimeTek lion mascot), "PRIME" text
5. "RxJS" — magenta (#B7178C) diamond, white "Rx"
6. "Chart.js" — a simple LINE CHART icon with 3 colored lines (red, blue, yellow) going upward — NOT a pie chart
7. "pdfmake" — red PDF document icon
8. "NgRx" — purple (#BA2BD2) shield, white angular symbol

═══════════════════════════════════════════════════
ROW 3 — "Database & Storage" (label bar: green #10B981) — exactly 2 cards
═══════════════════════════════════════════════════
1. "SQL Server" — red/orange cylinder database icon, "Microsoft SQL Server" wordmark
2. "MinIO" — red (#C72C48) flamingo bird, "MinIO" text

═══════════════════════════════════════════════════
ROW 4 — "DevOps & Infrastructure" (label bar: dark gray #334155) — exactly 4 cards
═══════════════════════════════════════════════════
1. "Docker" — light blue (#2496ED) whale carrying containers
2. "Docker Compose" — Docker whale with layered containers, label "Compose"
3. "Nginx" — bright green (#009639) "NGINX" text
4. "Let's Encrypt" — blue lock icon, "Let's Encrypt" text

═══════════════════════════════════════════════════
ROW 5 — "Architecture & Patterns" (label bar: rose #E11D48) — exactly 6 cards
═══════════════════════════════════════════════════
Illustrated concept icons (NOT brand logos):
1. "Modular System" — colored puzzle pieces fitting together (blue tint)
2. "N-Tier Layered" — 4 stacked layers: Controller → Service → Repository → Database (orange tint)
3. "RBAC Permissions" — shield with key and checkmark grid (purple tint)
4. "Code-First Migration" — code file → arrow → database cylinder (green tint)
5. "Auto API Client Gen" — Swagger doc → arrow → TypeScript code (teal tint)
6. "Soft Delete + Audit" — trash icon with undo arrow and clock (gray tint)

═══════════════════════════════════════════════════
ROW 6 — "Key Features" (label bar: purple #7C3AED) — exactly 8 cards
═══════════════════════════════════════════════════
Illustrated icons (NOT brand logos):
1. "QR Ordering" — smartphone scanning QR code (green tint)
2. "Real-time OrderHub" — lightning bolt with broadcast waves (orange tint)
3. "Kitchen Display" — monitor showing order tickets (red tint)
4. "Slip OCR Verify" — bank slip + magnifying glass + checkmark (teal tint)
5. "PDF Receipt" — PDF document with download arrow (blue tint)
6. "Mobile Web" — smartphone showing food ordering UI (green tint)
7. "Real-time Notification" — bell with red badge number (amber tint)
8. "reCAPTCHA v3" — Google reCAPTCHA logo: blue circle, white checkmark

═══════════════════════════════════════════════════
STYLE
═══════════════════════════════════════════════════
- Use OFFICIAL brand logos with correct colors for rows 1-4
- Rows 5-6 use illustrated concept icons
- Colored vertical label bar (40px) on left of each row, white text
- Flat design, no 3D, subtle card shadow OK
- Clean sans-serif font (Inter / Segoe UI)
- Professional university presentation quality
```

### Prompt 7: Project Overview Infographic (ตัวเลขภาพรวมโปรเจค)

```
Create a professional infographic-style overview image for a Restaurant POS project called "RBMS-POS".
Show KEY STATISTICS only — big numbers, small icons, minimal text.
White background, 16:9 aspect ratio, presentation slide.

Title at top center: "RBMS-POS — Project Overview"

═══════════════════════════════════════════════════
LAYOUT — exactly 8 cards in 2 rows (4 per row) + 1 bottom strip
═══════════════════════════════════════════════════

STRICT RULES:
- Exactly 8 cards + 1 bottom strip — do NOT add extra cards
- Numbers are the HERO element — very large, bold, colored
- Each card: white background, colored left border (4px), subtle shadow

═══════════════════════════════════════════════════
ROW 1 — Project Scale (4 cards)
═══════════════════════════════════════════════════

CARD 1 (blue #3B82F6):
- Icon: puzzle pieces / module blocks
- Number: "13"
- Label: "Modules"
- Subtitle: "8 Backend + 11 Client + 5 Mobile"

CARD 2 (orange #F97316):
- Icon: checklist with checkmarks
- Number: "162"
- Label: "Features"
- Subtitle: "All tested ✓"

CARD 3 (green #10B981):
- Icon: API network nodes
- Number: "215"
- Label: "API Endpoints"
- Subtitle: "24 Controllers"

CARD 4 (purple #7C3AED):
- Icon: database cylinder
- Number: "37"
- Label: "Database Tables"
- Subtitle: "6 Domain Groups"

═══════════════════════════════════════════════════
ROW 2 — Architecture (4 cards)
═══════════════════════════════════════════════════

CARD 5 (teal #14B8A6):
- Icon: two people (staff + customer)
- Number: "2"
- Label: "User Roles"
- Subtitle: "Staff (Desktop) + Customer (Mobile)"

CARD 6 (red #EF4444):
- Icon: lightning bolt with broadcast waves
- Number: "2"
- Label: "SignalR Hubs"
- Subtitle: "Real-time, 9 Event Types"

CARD 7 (rose #E11D48):
- Icon: colored puzzle pieces
- Number: "8"
- Label: "Business Modules"
- Subtitle: "Modular System"

CARD 8 (indigo #4F46E5):
- Icon: 4 stacked layers (Controller → Service → Repository → Database)
- Number: "4"
- Label: "Architecture Layers"
- Subtitle: "N-Tier Layered"

═══════════════════════════════════════════════════
BOTTOM STRIP — Key Features (horizontal bar, 5 mini icons)
═══════════════════════════════════════════════════

1. QR icon → "QR Ordering" / "Self-Service"
2. Magnifying glass + slip → "Slip OCR" / "Auto-Verify"
3. PDF document → "PDF Receipt" / "Auto-Generate"
4. Bell with badge → "Notifications" / "9 Types, 4 Groups"
5. Trash + undo arrow → "Soft Delete + Audit Trail" / "Auto-Tracking"

═══════════════════════════════════════════════════
STYLE
═══════════════════════════════════════════════════
- Numbers: very large (48-72pt), bold, in card's accent color
- Icons: clean flat illustrations, not photos, not 3D
- Labels: dark gray (#1E293B), subtitles: lighter gray (#64748B)
- White (#FFFFFF) background, clean sans-serif font
- Professional university presentation quality
- The image should feel like "look how much we built"
```

---

## บทพูดประกอบ Diagram ทั้งหมด (Presentation Scripts)

> รวมบทพูดสำหรับอธิบายแต่ละ Diagram ตอนพรีเซนต์ เรียงตามลำดับ Prompt

---

### บทพูด Prompt 1: System Architecture Diagram

> พูดตามลำดับจากบนลงล่าง (~1-2 นาที)

---

**เปิด:**
"ภาพนี้แสดงภาพรวมของระบบ RBMS-POS ทั้งหมดว่ามีกี่ส่วน แต่ละส่วนเชื่อมต่อกันยังไง"

---

**Layer 1 — ผู้ใช้งาน:**
"ระบบเรามีผู้ใช้ 2 กลุ่ม — ฝั่งซ้ายคือ Admin กับ Staff ที่ใช้งานผ่าน Client Web บนคอมพิวเตอร์ สำหรับจัดการออเดอร์ ดูหน้าจอครัว จัดการเมนู พนักงาน ตั้งค่าร้าน ฝั่งขวาคือลูกค้า ที่สแกน QR Code ที่โต๊ะแล้วสั่งอาหารผ่าน Mobile Web บนมือถือ ทั้งสองฝั่งสร้างด้วย Angular 19 เหมือนกัน แต่แยก Codebase เพราะ UI และฟีเจอร์ต่างกัน"

---

**Layer 2 — Nginx:**
"ทุก request จากทั้งสองฝั่งจะผ่าน Nginx ก่อน ซึ่งทำหน้าที่เป็น Reverse Proxy คือรับ request แล้วแยกส่งไปที่ถูกต้อง — ถ้าเป็น /api จะส่งไป Backend ถ้าเป็น /hub จะส่งไป SignalR ตรงนี้ Certbot จะจัดการต่อใบรับรอง SSL ให้อัตโนมัติ ทำให้ทุกการเชื่อมต่อเป็น HTTPS ตลอด"

---

**Layer 3 — Backend (เน้น):**
"ส่วนนี้คือหัวใจของระบบ — Backend API สร้างด้วย ASP.NET Core 9 มีทั้งหมด 24 Controllers รวม 215 API endpoints ข้างในแบ่งเป็น 8 Business Modules เช่น Order, Menu, Payment, Kitchen

จุดสำคัญคือ **SignalR Hub** ที่เป็นเส้นประในรูป — ปกติ REST API จะเป็นแบบ ถาม-ตอบ คือ Frontend ถาม Backend ตอบ แต่ SignalR ทำให้ Backend **ส่งข้อมูลไปหา Frontend ได้เอง** โดยไม่ต้องรอถาม เช่น ลูกค้าสั่งอาหารปุ๊บ หน้าจอครัวเห็นทันที แคชเชียร์เห็นทันที โดยไม่ต้อง refresh

นอกจากนี้ยังมี Slip OCR ที่อ่าน QR ในสลิปและตรวจจำนวนเงินอัตโนมัติ Background Jobs ที่ทำความสะอาดข้อมูลชั่วครามและเตือนการจอง และ Email Service สำหรับส่ง OTP ตอนลืมรหัสผ่าน"

---

**Layer 4 — Data Storage:**
"ข้อมูลเก็บ 2 ที่ — SQL Server เก็บข้อมูลทั้งหมด 37 ตาราง ตั้งแต่ออเดอร์ เมนู พนักงาน การชำระเงิน ส่วน MinIO เก็บไฟล์ทั้งหมด เช่น รูปเมนู รูปโปรไฟล์ สลิปโอนเงิน โลโก้ร้าน โดย MinIO เป็น S3-Compatible คือใช้มาตรฐานเดียวกับ AWS S3 แต่เราโฮสต์เองได้"

---

**Docker + External:**
"ทุกอย่างที่เห็นในกรอบเส้นประนี้ รันอยู่ใน Docker Container ทั้งหมด สั่ง docker compose up ครั้งเดียวก็ได้ทั้งระบบ ส่วนนอก Docker มี 2 บริการภายนอกคือ Gmail สำหรับส่งเมล และ Google reCAPTCHA สำหรับป้องกัน Bot ตอน Login"

---

**ปิด:**
"สรุปคือระบบนี้มีทั้ง Frontend 2 ตัว, Backend 1 ตัว, Database, File Storage, Reverse Proxy รวมอยู่ใน Docker ทำงานร่วมกันผ่าน REST API และ Real-time WebSocket"

---

### บทพูด Prompt 2: Data Flow Diagram

> พูดตาม Step 1-8 แต่รวบบางจุดที่ไม่ต้องอธิบายยาว (~1-1.5 นาที)

---

**เปิด:**
"ภาพนี้แสดง Flow การใช้งานจริงของลูกค้าตั้งแต่เข้าร้านจนกลับบ้าน ทั้งหมด 8 ขั้นตอน แถวบนเป็นขั้นตอนสั่งอาหาร แถวล่างเป็นขั้นตอนชำระเงิน"

---

**Step 1-2 (รวบ):**
"เริ่มจากลูกค้าสแกน QR Code ที่โต๊ะ ระบบจะให้ Session Token เชื่อมกับโต๊ะนั้นอัตโนมัติ จากนั้นลูกค้าเลือกเมนูตามหมวดหมู่ เลือกตัวเลือกเสริมเช่นระดับความเผ็ด ใส่ตะกร้า แล้วกดสั่ง ตรงนี้ข้อมูลจะวิ่งผ่าน Nginx ไป Backend แล้วบันทึกลง Database"

---

**Step 3 (เน้น — Real-time):**
"จุดสำคัญคือ Step 3 — พอลูกค้ากดสั่งปุ๊บ ออเดอร์จะปรากฏบนหน้าจอครัวทันทีผ่าน SignalR โดยไม่ต้อง refresh หน้า ครัวก็เริ่มทำ อัพเดตสถานะจาก Pending เป็น Cooking แล้วเป็น Ready"

---

**Step 4 (เน้น — ฟีเจอร์เด่น):**
"ระหว่างรออาหาร ลูกค้าจะเห็นสถานะของทุกเมนูที่สั่งบนมือถือแบบ Real-time เลย เช่นเมนูไหนกำลังทำ เมนูไหนพร้อมเสิร์ฟแล้ว และถ้าต้องการอะไรก็กดปุ่มเรียกพนักงานได้เลย พนักงานจะได้รับแจ้งเตือนทันที"

---

**Step 5-6 (รวบ):**
"พออาหารเสร็จ พนักงานจะได้รับ notification ว่าพร้อมเสิร์ฟ ก็ไปรับมาเสิร์ฟที่โต๊ะ เมื่อทานเสร็จลูกค้ากดขอบิล ระบบจะคำนวณยอดรวมพร้อมค่าบริการให้อัตโนมัติ ตรงนี้ยังมีฟีเจอร์หารบิลด้วย ทั้งแบบหารเท่าและแบบเลือกตามรายการ"

---

**Step 7 (เน้น — Slip OCR):**
"การชำระเงินมี 2 ช่องทาง — เงินสดก็จ่ายที่แคชเชียร์ปกติ แต่ถ้าโอน QR ลูกค้าอัพโหลดสลิปมา ระบบจะอ่าน QR ในสลิปและตรวจจำนวนเงินให้อัตโนมัติ แล้วแคชเชียร์กดยืนยันอีกที"

---

**Step 8:**
"สุดท้ายลูกค้าดาวน์โหลดใบเสร็จเป็น PDF ได้ทั้งแบบรายบิลและรวม"

---

**ปิด:**
"สังเกตแถบด้านล่าง — สีเขียวคือฝั่งลูกค้า สีส้มคือ Backend ที่ทำงานอยู่เบื้องหลังทุกขั้นตอน สีน้ำเงินคือฝั่งพนักงาน ทั้งหมดนี้ทำงานร่วมกันแบบ Real-time"

---

### บทพูด Prompt 3: SignalR Real-time Diagram

> พูดตามลำดับ ตรงกลาง → 4 กลุ่ม → สรุป (~50 วินาที)

---

**เปิด:**
"ภาพนี้แสดงว่าระบบ Real-time ของเราทำงานยังไง ตรงกลางคือ SignalR Hub ซึ่งเป็นตัวกลางที่คอยกระจายข้อมูลไปให้ทุกฝ่ายแบบทันที โดยมี 2 Hub คือ OrderHub จัดการเรื่องออเดอร์กับครัว และ NotificationHub จัดการแจ้งเตือนทั่วไป"

---

**4 กลุ่ม (ไล่ทีละมุม):**
"ระบบแบ่งผู้ใช้เป็น 4 กลุ่ม แต่ละกลุ่มจะได้รับแจ้งเตือนเฉพาะที่เกี่ยวข้องกับตัวเองเท่านั้น

ฝั่งครัว — พอลูกค้าสั่งอาหาร ออเดอร์จะปรากฏบนหน้าจอครัวทันที ครัวกดเริ่มทำ กดเสร็จ สถานะก็ส่งกลับมา

ฝั่งพนักงานเสิร์ฟ — จะได้รับแจ้งเตือนเมื่ออาหารพร้อมเสิร์ฟ หรือเมื่อลูกค้ากดปุ่มเรียก

ฝั่งแคชเชียร์ — จะเห็นเมื่อลูกค้าขอบิล อัพโหลดสลิป หรือมีการชำระเงินเข้ามา แล้วก็กดยืนยันกลับไป

ฝั่งลูกค้า — จะเห็นสถานะอาหารที่สั่งเปลี่ยนแบบ Real-time เลย ไม่ต้อง refresh หน้า รวมถึงเห็นผลชำระเงินทันที"

---

**ปิด:**
"ทั้งหมดนี้ทำงานผ่าน WebSocket ซึ่งต่างจาก HTTP ปกติตรงที่ server ส่งข้อมูลไปหา client ได้เองโดยไม่ต้องรอถาม ทำให้ทุกคนเห็นข้อมูลเดียวกันพร้อมกันทันที"

---

### บทพูด Prompt 4: Database ER Diagram

> อธิบายภาพรวม → เน้น 2-3 กลุ่มสำคัญ → สรุปด้านล่าง (~50 วินาที)

---

**เปิด:**
"ภาพนี้แสดงการออกแบบฐานข้อมูลทั้งหมด 37 ตาราง แบ่งเป็น 6 กลุ่มตามหน้าที่ ลูกศรระหว่างกลุ่มแสดงว่าข้อมูลเชื่อมกันยังไง"

---

**กลุ่มสำคัญ (ไล่สั้นๆ):**
"กลุ่มที่ใหญ่ที่สุดคือ User & Auth มี 11 ตาราง เพราะนอกจากข้อมูลพนักงานแล้ว ยังรวมระบบสิทธิ์ด้วย ตั้งแต่ตำแหน่ง โมดูล ไปจนถึง Permission Matrix ที่กำหนดว่าตำแหน่งไหนเข้าถึงอะไรได้บ้าง

กลุ่ม Order ตรงกลางคือหัวใจของระบบ เก็บออเดอร์ รายการอาหาร บิล ตัวเลือกเสริม รวมถึง Self-Order Session ของลูกค้าที่สั่งผ่าน QR

กลุ่ม Shop & File เป็นกลุ่มที่เชื่อมกับทุกกลุ่ม เพราะ TbFiles เก็บไฟล์ทั้งหมดไว้ที่เดียว ไม่ว่าจะเป็นรูปเมนู รูปโปรไฟล์ หรือสลิปโอนเงิน"

---

**ลูกศร (เน้นสั้น):**
"สังเกตลูกศร — ทุกกลุ่มชี้เข้าหา Order เพราะออเดอร์ต้องรู้ว่าใครสั่ง สั่งเมนูอะไร โต๊ะไหน แล้ว Order ก็ชี้ไป Payment เพราะต้องออกบิลและชำระเงิน"

---

**ปิด:**
"ด้านล่างคือสิ่งที่ทุกตารางมีร่วมกัน — ทุกตารางมี Soft Delete คือลบแล้วข้อมูลยังอยู่ เรียกคืนได้ และมี Audit Trail บันทึกว่าใครสร้าง ใครแก้ไข เมื่อไหร่ อัตโนมัติ"

---

### บทพูด Prompt 5: Use Case Diagram

> อธิบายว่าใครทำอะไรได้ — Staff vs Customer (~50 วินาที)

---

**เปิด:**
"ภาพนี้แสดงว่าในระบบ RBMS-POS ใครทำอะไรได้บ้าง แบ่งเป็น 2 ฝั่ง — ฝั่งซ้ายคือพนักงานที่ใช้งานผ่าน Client Web บนคอมพิวเตอร์ ฝั่งขวาคือลูกค้าที่ใช้งานผ่าน Mobile Web บนมือถือ"

---

**ฟีเจอร์ร่วม (ตรงกลาง):**
"ตรงกลางเป็นสิ่งที่ทั้งสองฝั่งทำได้เหมือนกัน — ทั้งพนักงานและลูกค้าสามารถสั่งอาหาร ดูเมนู ติดตามสถานะ ขอบิลหรือแยกบิล ชำระเงิน และรับแจ้งเตือนได้ แต่วิธีใช้งานต่างกัน เช่น พนักงานสั่งผ่านหน้าจอคอม ลูกค้าสั่งผ่านมือถือ"

---

**ฝั่งพนักงาน (Staff Only):**
"ฝั่งซ้ายเป็นสิ่งที่เฉพาะพนักงานทำได้ — ดู Dashboard รายงานยอดขาย จัดการเมนูอาหาร จัดการโต๊ะและผังร้าน ดูหน้าจอครัว เปิด-ปิดรอบขาย จัดการพนักงานและสิทธิ์ และตั้งค่าร้าน ทั้งหมด 7 กลุ่มฟีเจอร์ที่ลูกค้าเข้าถึงไม่ได้"

---

**ฝั่งลูกค้า (Customer Only):**
"ฝั่งขวามี 3 อย่างที่เฉพาะลูกค้าเท่านั้น คือ สแกน QR Code เพื่อเข้าระบบ จัดการตะกร้าสินค้าและปรับแต่งตัวเลือก และกดปุ่มเรียกพนักงาน"

---

**ปิด:**
"สิ่งสำคัญคือด้านล่างที่เขียนว่า สิทธิ์ของพนักงานเป็นแบบ Dynamic ผ่าน Position-based RBAC คือไม่ได้กำหนดตายตัวว่าตำแหน่งไหนทำอะไรได้ แต่ Admin สามารถกำหนดสิทธิ์แต่ละตำแหน่งได้เองทุกเมื่อ"

---

### บทพูด Prompt 6: Technology Stack

> ไล่ทีละแถว เน้นว่าแต่ละตัวใช้ทำอะไรในโปรเจค (~1.5-2 นาที)

---

**เปิด:**
"ภาพนี้แสดงเทคโนโลยีทั้งหมดที่ใช้ในโปรเจค RBMS-POS แบ่งเป็น 6 กลุ่ม"

---

**Row 1 — Backend API:**
"ฝั่ง Backend สร้างด้วย .NET 9 และ ASP.NET Core เป็น Framework หลัก ใช้ EF Core จัดการฐานข้อมูลแบบ Code-First คือเขียนโค้ดแล้ว Generate ตารางให้อัตโนมัติ SignalR ทำให้ระบบส่งข้อมูลแบบ Real-time ได้ เช่น สั่งอาหารปุ๊บครัวเห็นทันที JWT ใช้ยืนยันตัวตนผู้ใช้ Swagger สร้างเอกสาร API อัตโนมัติ และ MailKit ใช้ส่งอีเมล OTP ตอนลืมรหัสผ่าน"

---

**Row 2 — Frontend:**
"ฝั่ง Frontend ใช้ Angular 19 เขียนด้วย TypeScript จัดหน้าตาด้วย Tailwind CSS และ PrimeNG ซึ่งเป็น UI Component Library ที่มี Table, Dialog, Dropdown พร้อมใช้ RxJS จัดการ Asynchronous Data Chart.js ทำกราฟใน Dashboard pdfmake สร้างใบเสร็จเป็น PDF ให้ดาวน์โหลดได้ และ NgRx จัดการ State ของแอป"

---

**Row 3+4 — Database & DevOps:**
"ข้อมูลเก็บใน SQL Server 37 ตาราง ไฟล์ต่างๆ เช่น รูปเมนู สลิปโอนเงิน เก็บใน MinIO ซึ่งเป็น Object Storage เหมือน AWS S3 แต่โฮสต์เองได้ ทั้งหมดรันใน Docker Container สั่ง docker compose up ครั้งเดียวได้ทั้งระบบ Nginx เป็น Reverse Proxy จัดการ routing และ Let's Encrypt ออกใบรับรอง SSL อัตโนมัติ"

---

**Row 5 — Architecture & Patterns:**
"ระบบออกแบบเป็น Modular System แบ่ง 8 Business Modules อิสระจากกัน ใช้สถาปัตยกรรม N-Tier Layered 4 ชั้น คือ Controller รับ request, Service ประมวลผล, Repository จัดการข้อมูล, Database เก็บข้อมูล มีระบบ RBAC กำหนดสิทธิ์ตามตำแหน่ง Code-First Migration จัดการ Database Schema ผ่านโค้ด Auto API Client Gen คือ Frontend ไม่ต้องเขียน API Service เอง generate จาก Swagger อัตโนมัติ และทุกตารางมี Soft Delete กับ Audit Trail ติดตามว่าใครทำอะไรเมื่อไหร่"

---

**Row 6 — Key Features:**
"ฟีเจอร์เด่นของระบบ — ลูกค้าสแกน QR สั่งอาหารเอง ระบบส่งออเดอร์ไปครัวแบบ Real-time มีหน้าจอครัวแยกต่างหาก ตรวจสลิปอัตโนมัติด้วย OCR สร้างใบเสร็จ PDF ลูกค้าใช้ผ่าน Mobile Web บนมือถือ มีแจ้งเตือนแบบ Real-time 9 ประเภท และ reCAPTCHA v3 ป้องกัน Bot"

---

**ปิด:**
"ทั้งหมดนี้คือเทคโนโลยี 35 ตัวที่ทำงานร่วมกันเป็นระบบ POS ครบวงจร"

---

### บทพูด Prompt 7: Project Overview

> พูดไล่ทีละแถว สรุปภาพรวมขนาดโปรเจค (~1 นาที)

---

**เปิด:**
"ภาพนี้สรุปภาพรวมทั้งหมดของโปรเจค RBMS-POS ว่าเราพัฒนาอะไรไปบ้าง"

---

**Row 1 — ขนาดโปรเจค:**
"ระบบทั้งหมดมี 13 Modules แบ่งเป็น 8 โมดูล Backend, 11 โมดูลฝั่ง Client Web, และ 5 โมดูลฝั่ง Mobile Web รวมทั้งหมด 162 ฟีเจอร์ที่ผ่านการทดสอบครบแล้ว Backend มี 215 API Endpoints ใน 24 Controllers และฐานข้อมูล 37 ตาราง แบ่งเป็น 6 กลุ่มตามหน้าที่"

---

**Row 2 — สถาปัตยกรรม:**
"ผู้ใช้มี 2 กลุ่ม คือพนักงานใช้ผ่านคอมพิวเตอร์ กับลูกค้าใช้ผ่านมือถือ มี SignalR Hub 2 ตัวที่ทำให้ข้อมูลอัพเดตแบบ Real-time ได้ เช่น ลูกค้าสั่งอาหารปุ๊บครัวเห็นทันที ระบบออกแบบเป็น 8 Business Modules อิสระจากกัน และใช้สถาปัตยกรรม 4 ชั้น แยก Controller, Service, Repository, Database ชัดเจน"

---

**Bottom Strip:**
"แถวล่างสุดคือฟีเจอร์เด่น — QR Ordering ลูกค้าสแกนสั่งเอง, Slip OCR ตรวจสลิปอัตโนมัติ, ใบเสร็จ PDF, แจ้งเตือน Real-time 9 ประเภทแยก 4 กลุ่มผู้รับ และทุกตารางมี Soft Delete กับ Audit Trail ติดตามการเปลี่ยนแปลงอัตโนมัติ"

---

### บทพูดสไลด์ปิดท้าย — สรุปผลและการนำไปใช้งาน

> สไลด์สุดท้าย สรุปว่าทำได้ตามเป้าไหม + นำไปใช้จริงได้ยังไง (~40 วินาที)

---

"จากการพัฒนาและทดสอบทั้งหมด ระบบ RBMS-POS ทำงานได้ครบตามวัตถุประสงค์ทั้ง 3 ข้อ และครอบคลุมขอบเขตทั้ง 10 ข้อที่กำหนดไว้ ระบบจัดการร้านอาหารได้ครบวงจร ตั้งแต่เมนู ออเดอร์ ครัว ชำระเงิน ไปจนถึงรายงานยอดขาย ลูกค้าสแกน QR สั่งอาหารเอง ติดตามสถานะ และชำระเงินได้บนมือถือ ทุกส่วนเชื่อมต่อและทำงานแบบ Real-time

ในแง่การนำไปใช้จริง ระบบ Deploy ด้วย Docker สั่งรันครั้งเดียวได้ทั้งระบบ รองรับร้านอาหารที่มีหลายโซน หลายครัว และระบบสิทธิ์แบบ RBAC ให้ร้านกำหนดสิทธิ์พนักงานเองได้โดยไม่ต้องแก้โค้ด สถาปัตยกรรมออกแบบเป็น Modular ทำให้ต่อยอดเพิ่มฟีเจอร์ได้ง่าย เช่น ระบบสมาชิก โปรโมชั่น หรือเชื่อมต่อระบบบัญชี

สรุปคือระบบพัฒนาได้ตรงตามที่ตั้งไว้ครบถ้วน พร้อมใช้งานจริงในเชิงธุรกิจ และมีศักยภาพต่อยอดได้ในอนาคต"
