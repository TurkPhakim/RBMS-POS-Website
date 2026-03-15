using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddForgotPasswordTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TbPasswordHistory",
                columns: table => new
                {
                    PasswordHistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbPasswordHistory", x => x.PasswordHistoryId);
                    table.ForeignKey(
                        name: "FK_TbPasswordHistory_TbUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "TbUsers",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbPasswordResetTokens",
                columns: table => new
                {
                    PasswordResetTokenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OtpCode = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    OtpExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OtpVerified = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    OtpAttempts = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ResetToken = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    ResetTokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbPasswordResetTokens", x => x.PasswordResetTokenId);
                    table.ForeignKey(
                        name: "FK_TbPasswordResetTokens_TbUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "TbUsers",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PasswordHistory_UserId",
                table: "TbPasswordHistory",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_ResetToken",
                table: "TbPasswordResetTokens",
                column: "ResetToken");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_UserUsed",
                table: "TbPasswordResetTokens",
                columns: new[] { "UserId", "IsUsed" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TbPasswordHistory");

            migrationBuilder.DropTable(
                name: "TbPasswordResetTokens");
        }
    }
}
