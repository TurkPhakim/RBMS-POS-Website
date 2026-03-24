using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class SplitMenuPermissionsByCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =============================================
            // 1. เพิ่ม 3 Modules ใหม่: menu-food, menu-beverage, menu-dessert
            //    (child ของ ModuleId=4 "เมนู")
            // =============================================
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 22, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, true, "menu-food", "จัดการเมนูอาหาร", 4, 2, null, null },
                    { 23, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, true, "menu-beverage", "จัดการเมนูเครื่องดื่ม", 4, 3, null, null },
                    { 24, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, true, "menu-dessert", "จัดการเมนูของหวาน", 4, 4, null, null }
                });

            // อัพเดต SortOrder: menu-option (21) → 5
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [SortOrder] = 5 WHERE [ModuleId] = 21;
            ");

            // =============================================
            // 2. เพิ่ม 12 AuthorizeMatrix entries (4 permissions × 3 categories)
            // =============================================
            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath",
                    "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    // menu-food permissions (ModuleId=22)
                    { 44, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 22, 1, "menu-food.read", null, null },
                    { 45, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 22, 2, "menu-food.create", null, null },
                    { 46, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 22, 3, "menu-food.update", null, null },
                    { 47, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 22, 4, "menu-food.delete", null, null },
                    // menu-beverage permissions (ModuleId=23)
                    { 48, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 23, 1, "menu-beverage.read", null, null },
                    { 49, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 23, 2, "menu-beverage.create", null, null },
                    { 50, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 23, 3, "menu-beverage.update", null, null },
                    { 51, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 23, 4, "menu-beverage.delete", null, null },
                    // menu-dessert permissions (ModuleId=24)
                    { 52, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 24, 1, "menu-dessert.read", null, null },
                    { 53, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 24, 2, "menu-dessert.create", null, null },
                    { 54, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 24, 3, "menu-dessert.update", null, null },
                    { 55, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 24, 4, "menu-dessert.delete", null, null }
                });

            // =============================================
            // 3. Migrate position grants: ตำแหน่งที่เคยมี menu-item.* ให้ได้รับ permission ใหม่ทั้ง 3 ประเภท
            // =============================================

            // menu-item.read (AM=14) → menu-food.read (44), menu-beverage.read (48), menu-dessert.read (52)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 44, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 14;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 48, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 14;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 52, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 14;
            ");

            // menu-item.create (AM=15) → menu-food.create (45), menu-beverage.create (49), menu-dessert.create (53)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 45, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 15;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 49, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 15;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 53, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 15;
            ");

            // menu-item.update (AM=16) → menu-food.update (46), menu-beverage.update (50), menu-dessert.update (54)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 46, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 16;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 50, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 16;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 54, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 16;
            ");

            // menu-item.delete (AM=17) → menu-food.delete (47), menu-beverage.delete (51), menu-dessert.delete (55)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 47, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 17;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 51, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 17;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 55, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 17;
            ");

            // =============================================
            // 4. ลบ module เดิม: menu-item (ModuleId=13, AMs 14-17)
            // =============================================
            migrationBuilder.Sql(@"
                DELETE FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] IN (14, 15, 16, 17);
                DELETE FROM [TbmAuthorizeMatrices] WHERE [AuthorizeMatrixId] IN (14, 15, 16, 17);
                DELETE FROM [TbmModules] WHERE [ModuleId] = 13;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restore module 13 (menu-item)
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[]
                {
                    13, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                    false, null, null, true, "menu-item", "จัดการเมนู", 4, 2, null, null
                });

            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath",
                    "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 14, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 13, 1, "menu-item.read", null, null },
                    { 15, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 13, 2, "menu-item.create", null, null },
                    { 16, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 13, 3, "menu-item.update", null, null },
                    { 17, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 13, 4, "menu-item.delete", null, null }
                });

            // Cleanup new permissions
            migrationBuilder.Sql(@"
                DELETE FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] IN (44,45,46,47,48,49,50,51,52,53,54,55);
            ");

            migrationBuilder.DeleteData(
                table: "TbmAuthorizeMatrices",
                keyColumn: "AuthorizeMatrixId",
                keyValues: new object[] { 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55 });

            migrationBuilder.DeleteData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValues: new object[] { 22, 23, 24 });

            // Restore menu-option SortOrder
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [SortOrder] = 3 WHERE [ModuleId] = 21;
            ");
        }
    }
}
