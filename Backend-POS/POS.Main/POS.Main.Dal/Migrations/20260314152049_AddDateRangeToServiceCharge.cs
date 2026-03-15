using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddDateRangeToServiceCharge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "TbServiceCharges",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "TbServiceCharges",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCharges_EndDate",
                table: "TbServiceCharges",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCharges_StartDate",
                table: "TbServiceCharges",
                column: "StartDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServiceCharges_EndDate",
                table: "TbServiceCharges");

            migrationBuilder.DropIndex(
                name: "IX_ServiceCharges_StartDate",
                table: "TbServiceCharges");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "TbServiceCharges");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "TbServiceCharges");
        }
    }
}
