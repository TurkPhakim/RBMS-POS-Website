using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class RenameModuleDisplayNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Dashboard child: "Dashboard" → "แดชบอร์ด"
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'แดชบอร์ด' WHERE ModuleId = 9");

            // Reservation child: "จัดการการจองโต๊ะ" → "จัดการจองโต๊ะ"
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'จัดการจองโต๊ะ' WHERE ModuleId = 25");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'Dashboard' WHERE ModuleId = 9");
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'จัดการการจองโต๊ะ' WHERE ModuleId = 25");
        }
    }
}
