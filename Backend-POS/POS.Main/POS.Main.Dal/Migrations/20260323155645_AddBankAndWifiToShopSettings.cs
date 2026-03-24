using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddBankAndWifiToShopSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccountName",
                table: "TbShopSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountNumber",
                table: "TbShopSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "TbShopSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WifiPassword",
                table: "TbShopSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WifiSsid",
                table: "TbShopSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "TbShopSettings",
                keyColumn: "ShopSettingsId",
                keyValue: 1,
                columns: new[] { "AccountName", "AccountNumber", "BankName", "WifiPassword", "WifiSsid" },
                values: new object[] { null, null, null, null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountName",
                table: "TbShopSettings");

            migrationBuilder.DropColumn(
                name: "AccountNumber",
                table: "TbShopSettings");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "TbShopSettings");

            migrationBuilder.DropColumn(
                name: "WifiPassword",
                table: "TbShopSettings");

            migrationBuilder.DropColumn(
                name: "WifiSsid",
                table: "TbShopSettings");
        }
    }
}
