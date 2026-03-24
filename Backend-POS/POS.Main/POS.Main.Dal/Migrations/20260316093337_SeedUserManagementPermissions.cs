using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class SeedUserManagementPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. เพิ่ม Module: user-management (child ของ admin-settings, ModuleId=2)
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[]
                {
                    19, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                    false, null, null, true, "user-management", "จัดการผู้ใช้งาน", 2, 4, null, null
                });

            // 2. เพิ่ม AuthorizeMatrix: user-management.read + user-management.update
            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath",
                    "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 34, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 19, 1, "user-management.read", null, null },
                    { 35, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 19, 3, "user-management.update", null, null }
                });

            // 3. ให้ admin position (PositionId=1) มีสิทธิ์ user-management
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions]
                    ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                VALUES
                    (34, 1, '2025-01-01T00:00:00Z', 0),
                    (35, 1, '2025-01-01T00:00:00Z', 0);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] IN (34, 35);
            ");

            migrationBuilder.DeleteData(
                table: "TbmAuthorizeMatrices",
                keyColumn: "AuthorizeMatrixId",
                keyValues: new object[] { 34, 35 });

            migrationBuilder.DeleteData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValue: 19);
        }
    }
}
