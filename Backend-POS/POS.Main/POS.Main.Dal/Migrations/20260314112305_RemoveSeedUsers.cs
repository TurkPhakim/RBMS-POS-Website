using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeedUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TbUsers",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "TbUsers",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "TbUsers",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TbUsers",
                columns: new[] { "UserId", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "Email", "IsActive", "LastLoginDate", "LastPasswordChangedDate", "LockedUntil", "PasswordHash", "UpdatedAt", "UpdatedBy", "Username" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "admin@rbms-pos.com", true, null, null, null, "$2a$12$jFxdbEzkVa0AKgGMgTUuzOHAjkCd2rB46tqHVxdZ1DIhjFV4hyGqy", null, null, "admin" },
                    { new Guid("00000000-0000-0000-0000-000000000002"), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "manager@rbms-pos.com", true, null, null, null, "$2a$12$fpUs6ZgTJQx.zxmSaYjji.rCPW/Mj/cj9j6zYeTOrqZWqIs7sQ4zO", null, null, "manager" },
                    { new Guid("00000000-0000-0000-0000-000000000003"), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "cashier@rbms-pos.com", true, null, null, null, "$2a$12$Oj0MxHU71XQrOq04Q3voJOFC42JliARijrR0wKLNHL1Xa1.CmePuG", null, null, "cashier" }
                });
        }
    }
}
