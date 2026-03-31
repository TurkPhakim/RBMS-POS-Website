using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerSlipOcrDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CustomerSlipIsAccountMatched",
                table: "TbOrderBills",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CustomerSlipIsDateToday",
                table: "TbOrderBills",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerSlipOcrAccountNumber",
                table: "TbOrderBills",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CustomerSlipOcrTransferDate",
                table: "TbOrderBills",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerSlipIsAccountMatched",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "CustomerSlipIsDateToday",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "CustomerSlipOcrAccountNumber",
                table: "TbOrderBills");

            migrationBuilder.DropColumn(
                name: "CustomerSlipOcrTransferDate",
                table: "TbOrderBills");
        }
    }
}
