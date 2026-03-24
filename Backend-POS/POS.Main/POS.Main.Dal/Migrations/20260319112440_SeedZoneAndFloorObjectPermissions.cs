using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class SeedZoneAndFloorObjectPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =============================================
            // 1. อัพเดต SortOrder ของ reservation (25) จาก 2 เป็น 4
            // =============================================
            migrationBuilder.UpdateData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValue: 25,
                column: "SortOrder",
                value: 4);

            // =============================================
            // 2. เพิ่ม Module: zone (child ของ table=6)
            // =============================================
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[]
                {
                    26, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                    false, null, null, true, "zone", "จัดการโซน", 6, 2, null, null
                });

            // =============================================
            // 3. เพิ่ม Module: floor-object (child ของ table=6)
            // =============================================
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[]
                {
                    27, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                    false, null, null, true, "floor-object", "วัตถุบนผัง", 6, 3, null, null
                });

            // =============================================
            // 4. เพิ่ม 8 AuthorizeMatrix entries (zone + floor-object)
            // =============================================
            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath",
                    "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    // zone permissions (ModuleId=26)
                    { 60, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 26, 1, "zone.read", null, null },
                    { 61, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 26, 2, "zone.create", null, null },
                    { 62, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 26, 3, "zone.update", null, null },
                    { 63, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 26, 4, "zone.delete", null, null },
                    // floor-object permissions (ModuleId=27)
                    { 64, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 27, 1, "floor-object.read", null, null },
                    { 65, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 27, 2, "floor-object.create", null, null },
                    { 66, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 27, 3, "floor-object.update", null, null },
                    { 67, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 27, 4, "floor-object.delete", null, null }
                });

            // =============================================
            // 5. Grant: ตำแหน่งที่มี table-manage.* ให้ได้ zone.* + floor-object.* ด้วย
            // =============================================

            // table-manage.read (AM=22) → zone.read (AM=60)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 60, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 22 AND [DeleteFlag] = 0;
            ");
            // table-manage.create (AM=23) → zone.create (AM=61)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 61, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 23 AND [DeleteFlag] = 0;
            ");
            // table-manage.update (AM=24) → zone.update (AM=62)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 62, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 24 AND [DeleteFlag] = 0;
            ");
            // table-manage.delete (AM=25) → zone.delete (AM=63)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 63, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 25 AND [DeleteFlag] = 0;
            ");

            // table-manage.read (AM=22) → floor-object.read (AM=64)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 64, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 22 AND [DeleteFlag] = 0;
            ");
            // table-manage.create (AM=23) → floor-object.create (AM=65)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 65, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 23 AND [DeleteFlag] = 0;
            ");
            // table-manage.update (AM=24) → floor-object.update (AM=66)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 66, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 24 AND [DeleteFlag] = 0;
            ");
            // table-manage.delete (AM=25) → floor-object.delete (AM=67)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 67, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 25 AND [DeleteFlag] = 0;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // ลบ permission grants
            migrationBuilder.Sql(@"
                DELETE FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] IN (60, 61, 62, 63, 64, 65, 66, 67);
            ");

            // ลบ AuthorizeMatrix entries
            migrationBuilder.DeleteData(
                table: "TbmAuthorizeMatrices",
                keyColumn: "AuthorizeMatrixId",
                keyValues: new object[] { 60, 61, 62, 63, 64, 65, 66, 67 });

            // ลบ Modules
            migrationBuilder.DeleteData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValues: new object[] { 26, 27 });

            // คืน SortOrder ของ reservation
            migrationBuilder.UpdateData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValue: 25,
                column: "SortOrder",
                value: 2);
        }
    }
}
