using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddFullTimeAndHourlyRate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "HourlyRate",
                table: "TbEmployees",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFullTime",
                table: "TbEmployees",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HourlyRate",
                table: "TbEmployees");

            migrationBuilder.DropColumn(
                name: "IsFullTime",
                table: "TbEmployees");
        }
    }
}
