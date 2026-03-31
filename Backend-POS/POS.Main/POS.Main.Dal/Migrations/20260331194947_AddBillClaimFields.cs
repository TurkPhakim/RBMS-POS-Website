using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddBillClaimFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClaimPaymentMethod",
                table: "TbOrderBills",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClaimedAt",
                table: "TbOrderBills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ClaimedBySessionId",
                table: "TbOrderBills",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderBills_ClaimedBySessionId",
                table: "TbOrderBills",
                column: "ClaimedBySessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_TbOrderBills_TbCustomerSessions_ClaimedBySessionId",
                table: "TbOrderBills",
                column: "ClaimedBySessionId",
                principalTable: "TbCustomerSessions",
                principalColumn: "CustomerSessionId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TbOrderBills_TbCustomerSessions_ClaimedBySessionId",
                table: "TbOrderBills");

            migrationBuilder.DropIndex(
                name: "IX_TbOrderBills_ClaimedBySessionId",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "ClaimPaymentMethod",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "ClaimedAt",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "ClaimedBySessionId",
                table: "TbOrderBills");
        }
    }
}
