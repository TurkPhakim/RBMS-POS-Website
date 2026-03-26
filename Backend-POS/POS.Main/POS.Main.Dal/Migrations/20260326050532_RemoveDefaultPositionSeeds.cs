using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDefaultPositionSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TbmPositions",
                keyColumn: "PositionId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "TbmPositions",
                keyColumn: "PositionId",
                keyValue: 3);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TbmPositions",
                columns: new[] { "PositionId", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "Description", "IsActive", "PositionName", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "จัดการร้านค้า ดูรายงาน จัดการพนักงาน", true, "ผู้จัดการ", null, null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "รับออเดอร์ ชำระเงิน", true, "แคชเชียร์", null, null }
                });
        }
    }
}
