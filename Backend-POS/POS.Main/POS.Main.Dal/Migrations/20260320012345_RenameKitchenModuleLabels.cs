using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class RenameKitchenModuleLabels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // เปลี่ยนชื่อ module ครัว
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [ModuleName] = N'บาร์เครื่องดื่ม' WHERE [ModuleId] = 29;
                UPDATE [TbmModules] SET [ModuleName] = N'ครัวขนมหวาน' WHERE [ModuleId] = 30;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [ModuleName] = N'ครัวเครื่องดื่ม' WHERE [ModuleId] = 29;
                UPDATE [TbmModules] SET [ModuleName] = N'ครัวของหวาน' WHERE [ModuleId] = 30;
            ");
        }
    }
}
