using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddQrShortCodeToTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QrShortCode",
                table: "TbTables",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tables_QrShortCode",
                table: "TbTables",
                column: "QrShortCode",
                unique: true,
                filter: "[QrShortCode] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tables_QrShortCode",
                table: "TbTables");

            migrationBuilder.DropColumn(
                name: "QrShortCode",
                table: "TbTables");
        }
    }
}
