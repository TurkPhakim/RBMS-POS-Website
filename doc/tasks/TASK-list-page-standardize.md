# TASK: ปรับ List Pages ให้ใช้ Server-Side Pagination + Consolidated Handler เป็นมาตรฐาน

> สร้าง: 2026-03-21

## เป้าหมาย
ตั้งกฎใหม่: **ทุก list page ต้องใช้ server-side pagination (lazy load) เท่านั้น**
พร้อมรวม handler functions ให้เหลือน้อยที่สุด ใช้ `onFilterChange()` pattern เดียวกันทั้งระบบ

## Standard Pattern ที่ตกลง

### TS Pattern
```typescript
// Filter state — plain properties
searchTerm = '';
statusFilter: string | null = null;
page = 1;
rows = 10;

// API response — signals
items = signal<Xxx[]>([]);
totalRecords = signal(0);

// 1. Generic filter change (ใช้กับทุก filter)
onFilterChange(): void {
  this.page = 1;
  this.loadXxx();
}

// 2. Pagination
onPageChange(event: { first?: number; rows?: number }): void {
  this.page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows)) + 1;
  this.rows = event.rows ?? this.rows;
  this.loadXxx();
}

// 3. Special case (ถ้าต้อง reset filter อื่น) — เช่น zone → reset table
onZoneChange(value: number | null): void {
  this.zoneFilter = value;
  this.tableFilter = null;
  this.onFilterChange();
}
```

### HTML Pattern
```html
<!-- Search: bind ตรง + enter trigger -->
<input [(ngModel)]="searchTerm" (keyup.enter)="onFilterChange()" />

<!-- Dropdown: bind ตรง + change trigger -->
<app-xxx-dropdown [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()" />

<!-- Table: lazy load -->
<p-table [lazy]="true" [totalRecords]="totalRecords()" (onLazyLoad)="onPageChange(...)" />
```

---

## หน้าที่ต้องแก้

### Phase 1: Consolidate Server-Side Handlers (FE Only)
หน้าที่ใช้ server-side อยู่แล้ว แต่มี handler เยอะ → รวมให้ใช้ `onFilterChange()`

| หน้า | handlers เดิม | handlers ใหม่ | หมายเหตุ |
|------|---------------|---------------|----------|
| order-list | 6 | 3 | zone → reset table (special) |
| menu-list | 5 | 2 | signal → plain property |
| table-list | 4 | 2 | signal → plain property |
| option-group-list | 4 | 2 | signal → plain property |

- ✅ order-list — consolidate handlers
- ✅ menu-list — consolidate + signal→property
- ✅ table-list — consolidate + signal→property
- ✅ option-group-list — consolidate + signal→property

### Phase 2: Client-Side → Server-Side (FE + BE)
หน้าที่ใช้ `computed()` client-side → แปลงเป็น server-side

| หน้า | BE รองรับ filter | ต้องแก้ BE |
|------|------------------|------------|
| employee-list | isActive, positionId ✅ | ไม่ต้อง |
| user-list | isActive, isLocked, positionId ✅ | ไม่ต้อง |
| position-list | Search เท่านั้น | ✅ เพิ่ม isActive แล้ว |
| service-charge-list | ไม่มี filter | ✅ เปลี่ยนเป็น PaginationResult + isActive + Search แล้ว |

- ✅ employee-list — ลบ computed(), ใช้ server-side + onFilterChange
- ✅ user-list — ลบ computed(), ใช้ server-side + onFilterChange
- ✅ position-list — BE: เพิ่ม isActive + FE: ลบ computed()
- ✅ service-charge-list — BE: เปลี่ยนเป็น PaginationResult + isActive + FE: ลบ computed()

### Phase 3: อัพเดตกฎ
- ✅ อัพเดต CLAUDE.md + Memory — เพิ่มกฎ server-side pagination + onFilterChange pattern

---

## ข้ามไม่แก้ (Special Pages)
- reservation-list — calendar view, ไม่ใช่ standard table
- sub-category-list — tab-based + drag-reorder
- zone-list — dual tab + drag-reorder

---

## สรุปการเปลี่ยนแปลง BE

### Position API (`GET /api/admin/positions`)
- เพิ่ม `[FromQuery] bool? isActive` parameter
- Filter: `query.Where(p => p.IsActive == isActive.Value)`

### ServiceCharge API (`GET /api/admin/servicecharges`)
- **เปลี่ยน response จาก `ListResponseModel` → `PaginationResult`**
- เพิ่ม `[FromQuery] PaginationModel param, [FromQuery] bool? isActive`
- เพิ่ม Search filter + isActive filter + pagination (Skip/Take)
- Controller: `ListSuccess` → `PagedSuccess`

### FE ทุกหน้าที่แก้
- ลบ `computed()`, `allXxx` signal, `onSearch()` handlers
- เพิ่ม `onFilterChange()` + `onPageChange()` + `loadXxx()` (server-side)
- Filter state: signal → plain properties
- p-table: เพิ่ม `[lazy]="true"` + `[totalRecords]` + `(onLazyLoad)`
- HTML binding: `[(ngModel)]="xxx"` + `(ngModelChange)="onFilterChange()"`

## รอ gen-api
- หลัง restart BE ต้องรัน `npm run gen-api` เพื่อให้ FE generated services/models อัพเดต
- FE อาจมี TS error จนกว่าจะ gen-api (เช่น `isActive` param ยังไม่มีใน generated type)
