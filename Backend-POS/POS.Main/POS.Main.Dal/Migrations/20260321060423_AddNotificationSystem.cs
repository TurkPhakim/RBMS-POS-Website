using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TbNotifications",
                columns: table => new
                {
                    NotificationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    TableId = table.Column<int>(type: "int", nullable: true),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    ReservationId = table.Column<int>(type: "int", nullable: true),
                    TargetGroup = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Payload = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbNotifications", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_TbNotifications_TbOrders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "TbOrders",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TbNotifications_TbReservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "TbReservations",
                        principalColumn: "ReservationId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TbNotifications_TbTables_TableId",
                        column: x => x.TableId,
                        principalTable: "TbTables",
                        principalColumn: "TableId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "TbNotificationReads",
                columns: table => new
                {
                    NotificationReadId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NotificationId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClearedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbNotificationReads", x => x.NotificationReadId);
                    table.ForeignKey(
                        name: "FK_TbNotificationReads_TbNotifications_NotificationId",
                        column: x => x.NotificationId,
                        principalTable: "TbNotifications",
                        principalColumn: "NotificationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TbNotificationReads_TbUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "TbUsers",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationReads_NotificationId_UserId",
                table: "TbNotificationReads",
                columns: new[] { "NotificationId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbNotificationReads_UserId",
                table: "TbNotificationReads",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedAt",
                table: "TbNotifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_EventType",
                table: "TbNotifications",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_OrderId",
                table: "TbNotifications",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TableId",
                table: "TbNotifications",
                column: "TableId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TargetGroup",
                table: "TbNotifications",
                column: "TargetGroup");

            migrationBuilder.CreateIndex(
                name: "IX_TbNotifications_ReservationId",
                table: "TbNotifications",
                column: "ReservationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TbNotificationReads");

            migrationBuilder.DropTable(
                name: "TbNotifications");
        }
    }
}
