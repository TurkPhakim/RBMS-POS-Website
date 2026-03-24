using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerSessionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TbCustomerSessions",
                columns: table => new
                {
                    CustomerSessionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableId = table.Column<int>(type: "int", nullable: false),
                    SessionToken = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Nickname = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DeviceFingerprint = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    QrTokenNonce = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbCustomerSessions", x => x.CustomerSessionId);
                    table.ForeignKey(
                        name: "FK_TbCustomerSessions_TbTables_TableId",
                        column: x => x.TableId,
                        principalTable: "TbTables",
                        principalColumn: "TableId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSessions_IsActive",
                table: "TbCustomerSessions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSessions_SessionToken",
                table: "TbCustomerSessions",
                column: "SessionToken");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSessions_TableId",
                table: "TbCustomerSessions",
                column: "TableId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TbCustomerSessions");
        }
    }
}
