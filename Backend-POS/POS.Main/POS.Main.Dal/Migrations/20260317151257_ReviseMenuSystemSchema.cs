using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class ReviseMenuSystemSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =============================================
            // 1. สร้างตาราง TbMenuSubCategories ก่อน (เพราะ TbMenus จะ FK ไปหา)
            // =============================================
            migrationBuilder.CreateTable(
                name: "TbMenuSubCategories",
                columns: table => new
                {
                    SubCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryType = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    DeleteFlag = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbMenuSubCategories", x => x.SubCategoryId);
                    table.ForeignKey(
                        name: "FK_TbMenuSubCategories_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbMenuSubCategories_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            // =============================================
            // 2. Seed default sub-categories (1 ต่อ CategoryType)
            // =============================================
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [TbMenuSubCategories] ON;
                INSERT INTO [TbMenuSubCategories] ([SubCategoryId], [CategoryType], [Name], [SortOrder], [IsActive], [CreatedAt], [DeleteFlag])
                VALUES
                    (1, 1, N'ทั่วไป', 0, 1, '2025-01-01T00:00:00Z', 0),
                    (2, 2, N'ทั่วไป', 0, 1, '2025-01-01T00:00:00Z', 0),
                    (3, 3, N'ทั่วไป', 0, 1, '2025-01-01T00:00:00Z', 0);
                SET IDENTITY_INSERT [TbMenuSubCategories] OFF;
            ");

            // =============================================
            // 3. แก้ไข TbMenus — เพิ่ม SubCategoryId (nullable ก่อน) + migrate data + เปลี่ยนเป็น NOT NULL
            // =============================================

            // 3a. เพิ่ม SubCategoryId เป็น nullable ก่อน
            migrationBuilder.AddColumn<int>(
                name: "SubCategoryId",
                table: "TbMenus",
                type: "int",
                nullable: true);

            // 3b. Migrate data: map Category เดิม → SubCategoryId
            // Category เดิมเก็บเป็น string (HasConversion<string>): "Food"→1, "Beverage"→2
            migrationBuilder.Sql(@"
                UPDATE [TbMenus] SET [SubCategoryId] = CASE
                    WHEN [Category] = 'Food' THEN 1
                    WHEN [Category] = 'Beverage' THEN 2
                    ELSE 1
                END;
            ");

            // 3c. เปลี่ยน SubCategoryId เป็น NOT NULL
            migrationBuilder.AlterColumn<int>(
                name: "SubCategoryId",
                table: "TbMenus",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            // 3d. Drop indexes + column เดิม
            migrationBuilder.DropIndex(
                name: "IX_Menus_Category",
                table: "TbMenus");

            migrationBuilder.DropIndex(
                name: "IX_Menus_IsActive",
                table: "TbMenus");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "TbMenus");

            // 3e. Rename IsActive → IsAvailablePeriod2
            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "TbMenus",
                newName: "IsAvailablePeriod2");

            // 3f. เพิ่ม columns ใหม่
            migrationBuilder.AddColumn<string>(
                name: "Allergens",
                table: "TbMenus",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CaloriesPerServing",
                table: "TbMenus",
                type: "decimal(8,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CostPrice",
                table: "TbMenus",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAvailablePeriod1",
                table: "TbMenus",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPinned",
                table: "TbMenus",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Tags",
                table: "TbMenus",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // 3g. FK + Indexes สำหรับ TbMenus
            migrationBuilder.AddForeignKey(
                name: "FK_TbMenus_TbMenuSubCategories_SubCategoryId",
                table: "TbMenus",
                column: "SubCategoryId",
                principalTable: "TbMenuSubCategories",
                principalColumn: "SubCategoryId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.CreateIndex(
                name: "IX_Menus_SubCategoryId",
                table: "TbMenus",
                column: "SubCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Menus_IsPinned",
                table: "TbMenus",
                column: "IsPinned");

            // =============================================
            // 4. สร้างตาราง TbOptionGroups
            // =============================================
            migrationBuilder.CreateTable(
                name: "TbOptionGroups",
                columns: table => new
                {
                    OptionGroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CategoryType = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    MinSelect = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    MaxSelect = table.Column<int>(type: "int", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    DeleteFlag = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbOptionGroups", x => x.OptionGroupId);
                    table.ForeignKey(
                        name: "FK_TbOptionGroups_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOptionGroups_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            // =============================================
            // 5. สร้างตาราง TbOptionItems (FK cascade → TbOptionGroups)
            // =============================================
            migrationBuilder.CreateTable(
                name: "TbOptionItems",
                columns: table => new
                {
                    OptionItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OptionGroupId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AdditionalPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 0m),
                    CostPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    DeleteFlag = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbOptionItems", x => x.OptionItemId);
                    table.ForeignKey(
                        name: "FK_TbOptionItems_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOptionItems_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOptionItems_TbOptionGroups_OptionGroupId",
                        column: x => x.OptionGroupId,
                        principalTable: "TbOptionGroups",
                        principalColumn: "OptionGroupId",
                        onDelete: ReferentialAction.Cascade);
                });

            // =============================================
            // 6. สร้างตาราง TbMenuOptionGroups (junction table)
            // =============================================
            migrationBuilder.CreateTable(
                name: "TbMenuOptionGroups",
                columns: table => new
                {
                    MenuOptionGroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MenuId = table.Column<int>(type: "int", nullable: false),
                    OptionGroupId = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    DeleteFlag = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbMenuOptionGroups", x => x.MenuOptionGroupId);
                    table.ForeignKey(
                        name: "FK_TbMenuOptionGroups_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbMenuOptionGroups_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbMenuOptionGroups_TbMenus_MenuId",
                        column: x => x.MenuId,
                        principalTable: "TbMenus",
                        principalColumn: "MenuId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TbMenuOptionGroups_TbOptionGroups_OptionGroupId",
                        column: x => x.OptionGroupId,
                        principalTable: "TbOptionGroups",
                        principalColumn: "OptionGroupId",
                        onDelete: ReferentialAction.Restrict);
                });

            // =============================================
            // 7. Indexes สำหรับตารางใหม่
            // =============================================
            migrationBuilder.CreateIndex(
                name: "IX_MenuSubCategories_CategoryType",
                table: "TbMenuSubCategories",
                column: "CategoryType");

            migrationBuilder.CreateIndex(
                name: "IX_MenuSubCategories_DeleteFlag",
                table: "TbMenuSubCategories",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_MenuSubCategories_IsActive",
                table: "TbMenuSubCategories",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TbMenuSubCategories_CreatedBy",
                table: "TbMenuSubCategories",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbMenuSubCategories_UpdatedBy",
                table: "TbMenuSubCategories",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_OptionGroups_CategoryType",
                table: "TbOptionGroups",
                column: "CategoryType");

            migrationBuilder.CreateIndex(
                name: "IX_OptionGroups_IsActive",
                table: "TbOptionGroups",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TbOptionGroups_CreatedBy",
                table: "TbOptionGroups",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbOptionGroups_UpdatedBy",
                table: "TbOptionGroups",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_OptionItems_OptionGroupId",
                table: "TbOptionItems",
                column: "OptionGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_TbOptionItems_CreatedBy",
                table: "TbOptionItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbOptionItems_UpdatedBy",
                table: "TbOptionItems",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MenuOptionGroups_MenuId_OptionGroupId",
                table: "TbMenuOptionGroups",
                columns: new[] { "MenuId", "OptionGroupId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbMenuOptionGroups_CreatedBy",
                table: "TbMenuOptionGroups",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbMenuOptionGroups_OptionGroupId",
                table: "TbMenuOptionGroups",
                column: "OptionGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_TbMenuOptionGroups_UpdatedBy",
                table: "TbMenuOptionGroups",
                column: "UpdatedBy");

            // =============================================
            // 8. Seed Permissions — Modules + AuthorizeMatrices + Admin access
            // =============================================

            // Module 20: menu-category (child of menu, ModuleId=4)
            // Module 21: menu-option (child of menu, ModuleId=4)
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 20, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, true, "menu-category", "จัดการหมวดหมู่เมนู", 4, 1, null, null },
                    { 21, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, true, "menu-option", "จัดการตัวเลือกเสริม", 4, 3, null, null }
                });

            // Update menu-item (ModuleId=13) SortOrder → 2 (อยู่ระหว่าง category=1 กับ option=3)
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [SortOrder] = 2 WHERE [ModuleId] = 13;
            ");

            // AuthorizeMatrix 36-39: menu-category (read/create/update/delete)
            // AuthorizeMatrix 40-43: menu-option (read/create/update/delete)
            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath",
                    "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    // menu-category permissions
                    { 36, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 20, 1, "menu-category.read", null, null },
                    { 37, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 20, 2, "menu-category.create", null, null },
                    { 38, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 20, 3, "menu-category.update", null, null },
                    { 39, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 20, 4, "menu-category.delete", null, null },
                    // menu-option permissions
                    { 40, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 21, 1, "menu-option.read", null, null },
                    { 41, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 21, 2, "menu-option.create", null, null },
                    { 42, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 21, 3, "menu-option.update", null, null },
                    { 43, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 21, 4, "menu-option.delete", null, null }
                });

            // ให้ Admin position (PositionId=1) เข้าถึง permissions ใหม่ทั้งหมด
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions]
                    ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                VALUES
                    (36, 1, '2025-01-01T00:00:00Z', 0),
                    (37, 1, '2025-01-01T00:00:00Z', 0),
                    (38, 1, '2025-01-01T00:00:00Z', 0),
                    (39, 1, '2025-01-01T00:00:00Z', 0),
                    (40, 1, '2025-01-01T00:00:00Z', 0),
                    (41, 1, '2025-01-01T00:00:00Z', 0),
                    (42, 1, '2025-01-01T00:00:00Z', 0),
                    (43, 1, '2025-01-01T00:00:00Z', 0);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cleanup permissions
            migrationBuilder.Sql(@"
                DELETE FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] IN (36, 37, 38, 39, 40, 41, 42, 43);
            ");

            migrationBuilder.DeleteData(
                table: "TbmAuthorizeMatrices",
                keyColumn: "AuthorizeMatrixId",
                keyValues: new object[] { 36, 37, 38, 39, 40, 41, 42, 43 });

            migrationBuilder.DeleteData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValues: new object[] { 20, 21 });

            // Revert menu-item SortOrder
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [SortOrder] = 1 WHERE [ModuleId] = 13;
            ");

            // Drop new tables
            migrationBuilder.DropForeignKey(
                name: "FK_TbMenus_TbMenuSubCategories_SubCategoryId",
                table: "TbMenus");

            migrationBuilder.DropTable(
                name: "TbMenuOptionGroups");

            migrationBuilder.DropTable(
                name: "TbOptionItems");

            migrationBuilder.DropTable(
                name: "TbOptionGroups");

            // Revert TbMenus columns
            migrationBuilder.DropIndex(
                name: "IX_Menus_IsPinned",
                table: "TbMenus");

            migrationBuilder.DropIndex(
                name: "IX_Menus_SubCategoryId",
                table: "TbMenus");

            migrationBuilder.DropColumn(
                name: "Allergens",
                table: "TbMenus");

            migrationBuilder.DropColumn(
                name: "CaloriesPerServing",
                table: "TbMenus");

            migrationBuilder.DropColumn(
                name: "CostPrice",
                table: "TbMenus");

            migrationBuilder.DropColumn(
                name: "IsAvailablePeriod1",
                table: "TbMenus");

            migrationBuilder.DropColumn(
                name: "IsPinned",
                table: "TbMenus");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "TbMenus");

            // Restore Category column before dropping SubCategoryId
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "TbMenus",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            // Migrate SubCategoryId back to Category
            migrationBuilder.Sql(@"
                UPDATE m SET m.[Category] = CASE
                    WHEN sc.[CategoryType] = 1 THEN 'Food'
                    WHEN sc.[CategoryType] = 2 THEN 'Beverage'
                    ELSE 'Food'
                END
                FROM [TbMenus] m
                INNER JOIN [TbMenuSubCategories] sc ON m.[SubCategoryId] = sc.[SubCategoryId];
            ");

            migrationBuilder.DropColumn(
                name: "SubCategoryId",
                table: "TbMenus");

            // Rename IsAvailablePeriod2 back to IsActive
            migrationBuilder.RenameColumn(
                name: "IsAvailablePeriod2",
                table: "TbMenus",
                newName: "IsActive");

            // Restore indexes
            migrationBuilder.CreateIndex(
                name: "IX_Menus_Category",
                table: "TbMenus",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Menus_IsActive",
                table: "TbMenus",
                column: "IsActive");

            // Drop TbMenuSubCategories last
            migrationBuilder.DropTable(
                name: "TbMenuSubCategories");
        }
    }
}
