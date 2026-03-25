using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceChargeIdToOrderBill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ServiceChargeId",
                table: "TbOrderBills",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderBills_ServiceChargeId",
                table: "TbOrderBills",
                column: "ServiceChargeId");

            migrationBuilder.AddForeignKey(
                name: "FK_TbOrderBills_TbServiceCharges_ServiceChargeId",
                table: "TbOrderBills",
                column: "ServiceChargeId",
                principalTable: "TbServiceCharges",
                principalColumn: "ServiceChargeId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TbOrderBills_TbServiceCharges_ServiceChargeId",
                table: "TbOrderBills");

            migrationBuilder.DropIndex(
                name: "IX_TbOrderBills_ServiceChargeId",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "ServiceChargeId",
                table: "TbOrderBills");
        }
    }
}
