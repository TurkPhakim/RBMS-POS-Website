using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddSplitBillFieldsForReceipt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OrderBillId",
                table: "TbOrderItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SplitCount",
                table: "TbOrderBills",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SplitIndex",
                table: "TbOrderBills",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderItems_OrderBillId",
                table: "TbOrderItems",
                column: "OrderBillId");

            migrationBuilder.AddForeignKey(
                name: "FK_TbOrderItems_TbOrderBills_OrderBillId",
                table: "TbOrderItems",
                column: "OrderBillId",
                principalTable: "TbOrderBills",
                principalColumn: "OrderBillId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TbOrderItems_TbOrderBills_OrderBillId",
                table: "TbOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_TbOrderItems_OrderBillId",
                table: "TbOrderItems");

            migrationBuilder.DropColumn(
                name: "OrderBillId",
                table: "TbOrderItems");

            migrationBuilder.DropColumn(
                name: "SplitCount",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "SplitIndex",
                table: "TbOrderBills");
        }
    }
}
