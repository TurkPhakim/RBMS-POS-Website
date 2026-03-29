using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerSlipToOrderBill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TbPayments_TbFiles_SlipImageFileId",
                table: "TbPayments");

            migrationBuilder.AddColumn<int>(
                name: "CustomerSlipFileId",
                table: "TbOrderBills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CustomerSlipOcrAmount",
                table: "TbOrderBills",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerSlipVerificationStatus",
                table: "TbOrderBills",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderBills_CustomerSlipFileId",
                table: "TbOrderBills",
                column: "CustomerSlipFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_TbOrderBills_TbFiles_CustomerSlipFileId",
                table: "TbOrderBills",
                column: "CustomerSlipFileId",
                principalTable: "TbFiles",
                principalColumn: "FileId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TbPayments_TbFiles_SlipImageFileId",
                table: "TbPayments",
                column: "SlipImageFileId",
                principalTable: "TbFiles",
                principalColumn: "FileId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TbOrderBills_TbFiles_CustomerSlipFileId",
                table: "TbOrderBills");

            migrationBuilder.DropForeignKey(
                name: "FK_TbPayments_TbFiles_SlipImageFileId",
                table: "TbPayments");

            migrationBuilder.DropIndex(
                name: "IX_TbOrderBills_CustomerSlipFileId",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "CustomerSlipFileId",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "CustomerSlipOcrAmount",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "CustomerSlipVerificationStatus",
                table: "TbOrderBills");

            migrationBuilder.AddForeignKey(
                name: "FK_TbPayments_TbFiles_SlipImageFileId",
                table: "TbPayments",
                column: "SlipImageFileId",
                principalTable: "TbFiles",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
