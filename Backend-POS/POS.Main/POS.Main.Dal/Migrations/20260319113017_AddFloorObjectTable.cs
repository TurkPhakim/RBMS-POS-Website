using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddFloorObjectTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TbFloorObjects",
                columns: table => new
                {
                    FloorObjectId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ZoneId = table.Column<int>(type: "int", nullable: true),
                    ObjectType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PositionX = table.Column<double>(type: "float", nullable: false),
                    PositionY = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    DeleteFlag = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbFloorObjects", x => x.FloorObjectId);
                    table.ForeignKey(
                        name: "FK_TbFloorObjects_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbFloorObjects_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbFloorObjects_TbZones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "TbZones",
                        principalColumn: "ZoneId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FloorObjects_DeleteFlag",
                table: "TbFloorObjects",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_FloorObjects_ZoneId",
                table: "TbFloorObjects",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_TbFloorObjects_CreatedBy",
                table: "TbFloorObjects",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbFloorObjects_UpdatedBy",
                table: "TbFloorObjects",
                column: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TbFloorObjects");
        }
    }
}
