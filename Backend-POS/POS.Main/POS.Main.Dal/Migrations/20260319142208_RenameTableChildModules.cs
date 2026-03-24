using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class RenameTableChildModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. จัดวางผังร้าน (Module 27) → SortOrder = 0 (อันดับ 1)
            migrationBuilder.Sql("UPDATE TbmModules SET SortOrder = 0 WHERE ModuleId = 27");

            // 2. จัดการโต๊ะ → จัดการโซน/โต๊ะ (Module 15) → SortOrder = 1 (อันดับ 2)
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'จัดการโซน/โต๊ะ', SortOrder = 1 WHERE ModuleId = 15");

            // 3. การจอง → จัดการการจองโต๊ะ (Module 25) → SortOrder = 2 (อันดับ 3)
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'จัดการการจองโต๊ะ', SortOrder = 2 WHERE ModuleId = 25");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert names and sort order
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'จัดการโต๊ะ', SortOrder = 0 WHERE ModuleId = 15");
            migrationBuilder.Sql("UPDATE TbmModules SET SortOrder = 2 WHERE ModuleId = 27");
            migrationBuilder.Sql("UPDATE TbmModules SET ModuleName = N'การจอง', SortOrder = 2 WHERE ModuleId = 25");
        }
    }
}
