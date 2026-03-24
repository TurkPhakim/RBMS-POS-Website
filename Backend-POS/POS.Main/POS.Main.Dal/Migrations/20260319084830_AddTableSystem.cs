using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddTableSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TbZones",
                columns: table => new
                {
                    ZoneId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ZoneName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    DeleteFlag = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbZones", x => x.ZoneId);
                    table.ForeignKey(
                        name: "FK_TbZones_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbZones_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbTables",
                columns: table => new
                {
                    TableId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ZoneId = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    PositionX = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                    PositionY = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                    Shape = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Square"),
                    Size = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Medium"),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Available"),
                    CurrentGuests = table.Column<int>(type: "int", nullable: true),
                    GuestType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    OpenedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    QrToken = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    QrTokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    QrTokenNonce = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    DeleteFlag = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbTables", x => x.TableId);
                    table.ForeignKey(
                        name: "FK_TbTables_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbTables_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbTables_TbZones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "TbZones",
                        principalColumn: "ZoneId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbReservations",
                columns: table => new
                {
                    ReservationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CustomerPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ReservationDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ReservationTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    GuestCount = table.Column<int>(type: "int", nullable: false),
                    TableId = table.Column<int>(type: "int", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    ReminderSent = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    DeleteFlag = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbReservations", x => x.ReservationId);
                    table.ForeignKey(
                        name: "FK_TbReservations_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbReservations_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbReservations_TbTables_TableId",
                        column: x => x.TableId,
                        principalTable: "TbTables",
                        principalColumn: "TableId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbTableLinks",
                columns: table => new
                {
                    TableLinkId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TableId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    DeleteFlag = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbTableLinks", x => x.TableLinkId);
                    table.ForeignKey(
                        name: "FK_TbTableLinks_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbTableLinks_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbTableLinks_TbTables_TableId",
                        column: x => x.TableId,
                        principalTable: "TbTables",
                        principalColumn: "TableId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_Date_Status",
                table: "TbReservations",
                columns: new[] { "ReservationDate", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_DeleteFlag",
                table: "TbReservations",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_TableId",
                table: "TbReservations",
                column: "TableId");

            migrationBuilder.CreateIndex(
                name: "IX_TbReservations_CreatedBy",
                table: "TbReservations",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbReservations_UpdatedBy",
                table: "TbReservations",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TableLinks_GroupCode",
                table: "TbTableLinks",
                column: "GroupCode");

            migrationBuilder.CreateIndex(
                name: "IX_TableLinks_TableId",
                table: "TbTableLinks",
                column: "TableId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbTableLinks_CreatedBy",
                table: "TbTableLinks",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbTableLinks_UpdatedBy",
                table: "TbTableLinks",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Tables_DeleteFlag",
                table: "TbTables",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_Tables_Status",
                table: "TbTables",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Tables_TableName",
                table: "TbTables",
                column: "TableName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tables_ZoneId",
                table: "TbTables",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_TbTables_CreatedBy",
                table: "TbTables",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbTables_UpdatedBy",
                table: "TbTables",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbZones_CreatedBy",
                table: "TbZones",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbZones_UpdatedBy",
                table: "TbZones",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Zones_DeleteFlag",
                table: "TbZones",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_Zones_IsActive",
                table: "TbZones",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Zones_SortOrder",
                table: "TbZones",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_Zones_ZoneName",
                table: "TbZones",
                column: "ZoneName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TbReservations");

            migrationBuilder.DropTable(
                name: "TbTableLinks");

            migrationBuilder.DropTable(
                name: "TbTables");

            migrationBuilder.DropTable(
                name: "TbZones");
        }
    }
}
