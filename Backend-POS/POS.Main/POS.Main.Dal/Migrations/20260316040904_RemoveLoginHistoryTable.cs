using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLoginHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TbLoginHistory");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TbLoginHistory",
                columns: table => new
                {
                    LoginHistoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LoginDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    Success = table.Column<bool>(type: "bit", nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbLoginHistory", x => x.LoginHistoryId);
                    table.ForeignKey(
                        name: "FK_TbLoginHistory_TbUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "TbUsers",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LoginHistory_IpAddress",
                table: "TbLoginHistory",
                column: "IpAddress");

            migrationBuilder.CreateIndex(
                name: "IX_LoginHistory_LoginDate",
                table: "TbLoginHistory",
                column: "LoginDate");

            migrationBuilder.CreateIndex(
                name: "IX_LoginHistory_UserId",
                table: "TbLoginHistory",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LoginHistory_Username",
                table: "TbLoginHistory",
                column: "Username");
        }
    }
}
