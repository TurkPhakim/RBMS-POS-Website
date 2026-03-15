using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class ExpandEmployeeModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_EmploymentStatus",
                table: "TbEmployees");

            migrationBuilder.DropColumn(
                name: "EmploymentStatus",
                table: "TbEmployees");

            migrationBuilder.AddColumn<string>(
                name: "Ethnicity",
                table: "TbEmployees",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LineId",
                table: "TbEmployees",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nationality",
                table: "TbEmployees",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Religion",
                table: "TbEmployees",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TbEmployeeAddresses",
                columns: table => new
                {
                    AddressId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    AddressType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    HouseNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Building = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Moo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Soi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Yaek = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Road = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SubDistrict = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Province = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
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
                    table.PrimaryKey("PK_TbEmployeeAddresses", x => x.AddressId);
                    table.ForeignKey(
                        name: "FK_TbEmployeeAddresses_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbEmployeeAddresses_TbEmployees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TbEmployeeAddresses_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbEmployeeEducations",
                columns: table => new
                {
                    EducationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    EducationLevel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Major = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Institution = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Gpa = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    GraduationYear = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_TbEmployeeEducations", x => x.EducationId);
                    table.ForeignKey(
                        name: "FK_TbEmployeeEducations_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbEmployeeEducations_TbEmployees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TbEmployeeEducations_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbEmployeeWorkHistories",
                columns: table => new
                {
                    WorkHistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    Workplace = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    WorkPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Position = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_TbEmployeeWorkHistories", x => x.WorkHistoryId);
                    table.ForeignKey(
                        name: "FK_TbEmployeeWorkHistories_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbEmployeeWorkHistories_TbEmployees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TbEmployeeWorkHistories_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_IsActive",
                table: "TbEmployees",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAddresses_EmployeeId",
                table: "TbEmployeeAddresses",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_TbEmployeeAddresses_CreatedBy",
                table: "TbEmployeeAddresses",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbEmployeeAddresses_UpdatedBy",
                table: "TbEmployeeAddresses",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeEducations_EmployeeId",
                table: "TbEmployeeEducations",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_TbEmployeeEducations_CreatedBy",
                table: "TbEmployeeEducations",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbEmployeeEducations_UpdatedBy",
                table: "TbEmployeeEducations",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeWorkHistories_EmployeeId",
                table: "TbEmployeeWorkHistories",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_TbEmployeeWorkHistories_CreatedBy",
                table: "TbEmployeeWorkHistories",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbEmployeeWorkHistories_UpdatedBy",
                table: "TbEmployeeWorkHistories",
                column: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TbEmployeeAddresses");

            migrationBuilder.DropTable(
                name: "TbEmployeeEducations");

            migrationBuilder.DropTable(
                name: "TbEmployeeWorkHistories");

            migrationBuilder.DropIndex(
                name: "IX_Employees_IsActive",
                table: "TbEmployees");

            migrationBuilder.DropColumn(
                name: "Ethnicity",
                table: "TbEmployees");

            migrationBuilder.DropColumn(
                name: "LineId",
                table: "TbEmployees");

            migrationBuilder.DropColumn(
                name: "Nationality",
                table: "TbEmployees");

            migrationBuilder.DropColumn(
                name: "Religion",
                table: "TbEmployees");

            migrationBuilder.AddColumn<string>(
                name: "EmploymentStatus",
                table: "TbEmployees",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmploymentStatus",
                table: "TbEmployees",
                column: "EmploymentStatus");
        }
    }
}
