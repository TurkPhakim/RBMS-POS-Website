using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddPromptPayNumberToShopSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PromptPayNumber",
                table: "TbShopSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "TbShopSettings",
                keyColumn: "ShopSettingsId",
                keyValue: 1,
                column: "PromptPayNumber",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PromptPayNumber",
                table: "TbShopSettings");
        }
    }
}
