using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class RemoveShapeAndMergePermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Shape",
                table: "TbTables");

            // --- Merge Permissions: ลบ Zone module, เปลี่ยน FloorObject → FloorPlan ---

            // 1. ลบ position permissions ที่อ้าง Zone (AM IDs 60-63)
            migrationBuilder.Sql("DELETE FROM TbAuthorizeMatrixPositions WHERE AuthorizeMatrixId IN (60, 61, 62, 63)");

            // 2. ลบ Zone AuthorizeMatrix entries (IDs 60-63)
            migrationBuilder.Sql("DELETE FROM TbmAuthorizeMatrices WHERE AuthorizeMatrixId IN (60, 61, 62, 63)");

            // 3. ลบ Zone Module (ID 26)
            migrationBuilder.Sql("DELETE FROM TbmModules WHERE ModuleId = 26");

            // 4. เปลี่ยน Module 27 (วัตถุบนผัง → จัดวางผังร้าน)
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'จัดวางผังร้าน', ModuleCode = 'floor-plan', SortOrder = 2 WHERE ModuleId = 27");

            // 5. เปลี่ยน AuthorizeMatrix permission paths (floor-object.* → floor-plan.*)
            migrationBuilder.Sql("UPDATE TbmAuthorizeMatrices SET PermissionPath = 'floor-plan.read' WHERE AuthorizeMatrixId = 64");
            migrationBuilder.Sql("UPDATE TbmAuthorizeMatrices SET PermissionPath = 'floor-plan.create' WHERE AuthorizeMatrixId = 65");
            migrationBuilder.Sql("UPDATE TbmAuthorizeMatrices SET PermissionPath = 'floor-plan.update' WHERE AuthorizeMatrixId = 66");
            migrationBuilder.Sql("UPDATE TbmAuthorizeMatrices SET PermissionPath = 'floor-plan.delete' WHERE AuthorizeMatrixId = 67");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Shape",
                table: "TbTables",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Square");

            // --- Rollback Permissions ---

            // Restore FloorObject permission paths
            migrationBuilder.Sql("UPDATE TbmAuthorizeMatrices SET PermissionPath = 'floor-object.read' WHERE AuthorizeMatrixId = 64");
            migrationBuilder.Sql("UPDATE TbmAuthorizeMatrices SET PermissionPath = 'floor-object.create' WHERE AuthorizeMatrixId = 65");
            migrationBuilder.Sql("UPDATE TbmAuthorizeMatrices SET PermissionPath = 'floor-object.update' WHERE AuthorizeMatrixId = 66");
            migrationBuilder.Sql("UPDATE TbmAuthorizeMatrices SET PermissionPath = 'floor-object.delete' WHERE AuthorizeMatrixId = 67");

            // Restore Module 27 name
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'วัตถุบนผัง', ModuleCode = 'floor-object', SortOrder = 3 WHERE ModuleId = 27");

            // Restore Zone Module
            migrationBuilder.Sql("INSERT INTO TbmModules (ModuleId, ModuleName, ModuleCode, ParentModuleId, SortOrder, IsActive) VALUES (26, N'จัดการโซน', 'zone', 6, 2, 1)");

            // Restore Zone AuthorizeMatrix
            migrationBuilder.Sql("INSERT INTO TbmAuthorizeMatrices (AuthorizeMatrixId, ModuleId, PermissionId, PermissionPath) VALUES (60, 26, 1, 'zone.read')");
            migrationBuilder.Sql("INSERT INTO TbmAuthorizeMatrices (AuthorizeMatrixId, ModuleId, PermissionId, PermissionPath) VALUES (61, 26, 2, 'zone.create')");
            migrationBuilder.Sql("INSERT INTO TbmAuthorizeMatrices (AuthorizeMatrixId, ModuleId, PermissionId, PermissionPath) VALUES (62, 26, 3, 'zone.update')");
            migrationBuilder.Sql("INSERT INTO TbmAuthorizeMatrices (AuthorizeMatrixId, ModuleId, PermissionId, PermissionPath) VALUES (63, 26, 4, 'zone.delete')");
        }
    }
}
