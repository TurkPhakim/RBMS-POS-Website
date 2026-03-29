using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class ChangeActiveOrderToManyRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TbTables_ActiveOrderId",
                table: "TbTables");

            migrationBuilder.CreateIndex(
                name: "IX_TbTables_ActiveOrderId",
                table: "TbTables",
                column: "ActiveOrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TbTables_ActiveOrderId",
                table: "TbTables");

            migrationBuilder.CreateIndex(
                name: "IX_TbTables_ActiveOrderId",
                table: "TbTables",
                column: "ActiveOrderId",
                unique: true,
                filter: "[ActiveOrderId] IS NOT NULL");
        }
    }
}
