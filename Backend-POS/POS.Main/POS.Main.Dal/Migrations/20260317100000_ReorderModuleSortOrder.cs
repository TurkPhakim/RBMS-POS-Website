using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class ReorderModuleSortOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Parent modules — เรียงตาม Sidebar
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [SortOrder] = 1 WHERE [ModuleCode] = 'dashboard';
                UPDATE [TbmModules] SET [SortOrder] = 2 WHERE [ModuleCode] = 'order';
                UPDATE [TbmModules] SET [SortOrder] = 3 WHERE [ModuleCode] = 'menu';
                UPDATE [TbmModules] SET [SortOrder] = 4 WHERE [ModuleCode] = 'table';
                UPDATE [TbmModules] SET [SortOrder] = 5 WHERE [ModuleCode] = 'payment';
                UPDATE [TbmModules] SET [SortOrder] = 6 WHERE [ModuleCode] = 'kitchen-display';
                UPDATE [TbmModules] SET [SortOrder] = 7 WHERE [ModuleCode] = 'human-resource';
                UPDATE [TbmModules] SET [SortOrder] = 8 WHERE [ModuleCode] = 'admin-settings';
            ");

            // Children of admin-settings — เรียงตาม Sidebar
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [SortOrder] = 1 WHERE [ModuleCode] = 'user-management';
                UPDATE [TbmModules] SET [SortOrder] = 2 WHERE [ModuleCode] = 'position';
                UPDATE [TbmModules] SET [SortOrder] = 3 WHERE [ModuleCode] = 'shop-settings';
                UPDATE [TbmModules] SET [SortOrder] = 4 WHERE [ModuleCode] = 'service-charge';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert parent modules to original order
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [SortOrder] = 1 WHERE [ModuleCode] = 'dashboard';
                UPDATE [TbmModules] SET [SortOrder] = 2 WHERE [ModuleCode] = 'admin-settings';
                UPDATE [TbmModules] SET [SortOrder] = 3 WHERE [ModuleCode] = 'human-resource';
                UPDATE [TbmModules] SET [SortOrder] = 4 WHERE [ModuleCode] = 'menu';
                UPDATE [TbmModules] SET [SortOrder] = 5 WHERE [ModuleCode] = 'order';
                UPDATE [TbmModules] SET [SortOrder] = 6 WHERE [ModuleCode] = 'table';
                UPDATE [TbmModules] SET [SortOrder] = 7 WHERE [ModuleCode] = 'payment';
                UPDATE [TbmModules] SET [SortOrder] = 8 WHERE [ModuleCode] = 'kitchen-display';
            ");

            // Revert children of admin-settings
            migrationBuilder.Sql(@"
                UPDATE [TbmModules] SET [SortOrder] = 1 WHERE [ModuleCode] = 'service-charge';
                UPDATE [TbmModules] SET [SortOrder] = 2 WHERE [ModuleCode] = 'position';
                UPDATE [TbmModules] SET [SortOrder] = 3 WHERE [ModuleCode] = 'shop-settings';
                UPDATE [TbmModules] SET [SortOrder] = 4 WHERE [ModuleCode] = 'user-management';
            ");
        }
    }
}
