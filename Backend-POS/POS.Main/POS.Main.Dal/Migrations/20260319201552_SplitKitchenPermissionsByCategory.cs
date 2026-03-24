using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class SplitKitchenPermissionsByCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =============================================
            // 1. เพิ่ม 3 Modules ใหม่: kitchen-food, kitchen-beverage, kitchen-dessert
            //    (child ของ ModuleId=8 "ครัว")
            // =============================================
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 28, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, true, "kitchen-food", "ครัวอาหาร", 8, 1, null, null },
                    { 29, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, true, "kitchen-beverage", "ครัวเครื่องดื่ม", 8, 2, null, null },
                    { 30, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, true, "kitchen-dessert", "ครัวของหวาน", 8, 3, null, null }
                });

            // =============================================
            // 2. เพิ่ม 6 AuthorizeMatrix entries (2 permissions × 3 categories: read + update)
            // =============================================
            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath",
                    "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    // kitchen-food permissions (ModuleId=28)
                    { 68, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 28, 1, "kitchen-food.read", null, null },
                    { 69, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 28, 3, "kitchen-food.update", null, null },
                    // kitchen-beverage permissions (ModuleId=29)
                    { 70, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 29, 1, "kitchen-beverage.read", null, null },
                    { 71, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 29, 3, "kitchen-beverage.update", null, null },
                    // kitchen-dessert permissions (ModuleId=30)
                    { 72, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 30, 1, "kitchen-dessert.read", null, null },
                    { 73, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 30, 3, "kitchen-dessert.update", null, null }
                });

            // =============================================
            // 3. Migrate position grants: ตำแหน่งที่เคยมี kitchen-order.* ให้ได้รับ permission ใหม่ทั้ง 3 ประเภท
            // =============================================

            // kitchen-order.read (AM=30) → kitchen-food.read (68), kitchen-beverage.read (70), kitchen-dessert.read (72)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 68, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 30;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 70, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 30;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 72, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 30;
            ");

            // kitchen-order.update (AM=31) → kitchen-food.update (69), kitchen-beverage.update (71), kitchen-dessert.update (73)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 69, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 31;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 71, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 31;
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 73, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 31;
            ");

            // =============================================
            // 4. ลบ module เดิม: kitchen-order (ModuleId=17, AMs 30-31)
            // =============================================
            migrationBuilder.Sql(@"
                DELETE FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] IN (30, 31);
                DELETE FROM [TbmAuthorizeMatrices] WHERE [AuthorizeMatrixId] IN (30, 31);
                DELETE FROM [TbmModules] WHERE [ModuleId] = 17;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restore module 17 (kitchen-order)
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[]
                {
                    17, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                    false, null, null, true, "kitchen-order", "ออเดอร์ครัว", 8, 1, null, null
                });

            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath",
                    "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 30, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 17, 1, "kitchen-order.read", null, null },
                    { 31, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 17, 3, "kitchen-order.update", null, null }
                });

            // Cleanup new permissions
            migrationBuilder.Sql(@"
                DELETE FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] IN (68, 69, 70, 71, 72, 73);
            ");

            migrationBuilder.DeleteData(
                table: "TbmAuthorizeMatrices",
                keyColumn: "AuthorizeMatrixId",
                keyValues: new object[] { 68, 69, 70, 71, 72, 73 });

            migrationBuilder.DeleteData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValues: new object[] { 28, 29, 30 });
        }
    }
}
