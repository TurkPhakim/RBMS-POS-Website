# TASK: เปลี่ยน API Method Naming Pattern ด้วย CustomOperationIdFilter

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-13
**วันที่เสร็จ**: 2026-03-13

> เปลี่ยน API method naming จาก route-based (`apiHumanresourceGet`) เป็น action-based (`humanResourceGetEmployeesGet`) ด้วย CustomOperationIdFilter

---

## สรุปการเปลี่ยนแปลง

### Phase 1 — Backend: สร้าง CustomOperationIdFilter (DONE)

#### 1.1 สร้าง `CustomOperationIdFilter.cs` (`RBMS.POS.WebAPI/Filters/`)

**ปัญหาปัจจุบัน:**
- Swagger ไม่มี explicit operationId → ng-openapi-gen generate ชื่อ method จาก route path เช่น `apiHumanresourceGet`, `apiAdminPositionsPositionIdPut` — อ่านยาก ไม่สื่อความหมาย

**เป้าหมาย:**
- สร้าง `IOperationFilter` ที่ auto-generate operationId เป็น `{ControllerName}_{ActionName}_{HttpMethod}`
- ng-openapi-gen แปลงเป็น camelCase method name เช่น `humanResourceGetEmployeesGet`, `positionsUpdatePositionPut`

**ไฟล์ที่สร้าง/แก้ไข:**
- `Backend-POS/POS.Main/RBMS.POS.WebAPI/Filters/CustomOperationIdFilter.cs` (สร้างใหม่)
- `Backend-POS/POS.Main/RBMS.POS.WebAPI/Program.cs` (เพิ่ม `options.OperationFilter<CustomOperationIdFilter>()`)

---

### Phase 2 — Frontend: Regenerate + อัพเดต API Calls (DONE)

#### 2.1 Regenerate API client

- Download swagger.json ใหม่จาก Backend
- รัน `npm run gen-api:only` + `fix-api-exports` + `copy-api-config`
- `removeStaleFiles: true` ลบ function files เก่าอัตโนมัติ

#### 2.2 อัพเดต API method calls (13 ไฟล์)

| ไฟล์ | Old Method → New Method |
|------|------------------------|
| `core/services/auth.service.ts` | `apiAdminAuthLoginPost` → `authLoginPost`, `apiAdminAuthLogoutPost` → `authLogoutPost`, `apiAdminAuthRefreshTokenPost` → `authRefreshTokenPost` |
| `features/auths/pages/login/login.component.ts` | `apiAdminAuthLoginPost` → `authLoginPost` |
| `features/admin/pages/position-list/` | `apiAdminPositionsGet` → `positionsGetPositionsGet`, `apiAdminPositionsPositionIdDelete` → `positionsDeletePositionDelete` |
| `features/admin/pages/position-manage/` | 7 methods เปลี่ยนทั้งหมด (GetById, Permissions, ModulesTree, Create, Update, UpdatePermissions, GetMyPermissions) |
| `features/admin/pages/service-charge-list/` | `apiAdminServicechargesGet` → `serviceChargesGetAllGet`, `apiAdminServicechargesServiceChargeIdDelete` → `serviceChargesDeleteDelete` |
| `features/admin/pages/service-charge-manage/` | GetById, Create, Update เปลี่ยนทั้งหมด |
| `features/admin/pages/shop-settings/` | `apiAdminShopSettingsGet` → `shopSettingsGetGet`, `apiAdminShopSettingsPut` → `shopSettingsUpdatePut` |
| `features/human-resource/pages/employee-list/` | `apiHumanresourceGet` → `humanResourceGetEmployeesGet`, `apiHumanresourceEmployeeIdDelete` → `humanResourceDeleteDelete` |
| `features/human-resource/pages/employee-manage/` | GetById, Create, Update เปลี่ยนทั้งหมด |
| `features/human-resource/dialogs/create-user-dialog/` | `apiHumanresourceEmployeeIdCreateUserPost` → `humanResourceCreateUserAccountPost` |
| `features/menu/pages/menu-list/` | `apiMenuGet` → `menusGetAllGet`, `apiMenuMenuIdDelete` → `menusDeleteDelete` |
| `features/menu/pages/menu-manage/` | GetById, Create, Update เปลี่ยนทั้งหมด |
| `shared/dropdowns/position-dropdown/` | `apiAdminPositionsDropdownGet` → `positionsGetPositionDropdownGet` |

---

## หมายเหตุ

- **Pattern**: `{ControllerName}_{ActionName}_{HttpMethod}` → ng-openapi-gen แปลงเป็น `{controllerName}{ActionName}{HttpMethod}`
- **ไม่มี `$Json` suffix** — คง `[Produces("application/json")]` ไว้ที่ BaseController
- **คงชื่อ service เดิม** — ไม่เปลี่ยน tag (HumanResourceService, PositionsService, etc.)
- **กฎนี้ถูกเพิ่มใน CLAUDE.md** — ทุก Controller action ใหม่จะ auto-generate operationId ตาม pattern นี้
