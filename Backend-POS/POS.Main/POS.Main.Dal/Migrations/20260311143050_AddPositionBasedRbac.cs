using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddPositionBasedRbac : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Role",
                table: "TbUsers");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "TbUsers");

            migrationBuilder.DropColumn(
                name: "JobPosition",
                table: "TbEmployees");

            migrationBuilder.AddColumn<int>(
                name: "PositionId",
                table: "TbEmployees",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TbmModules",
                columns: table => new
                {
                    ModuleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ModuleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ParentModuleId = table.Column<int>(type: "int", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
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
                    table.PrimaryKey("PK_TbmModules", x => x.ModuleId);
                    table.ForeignKey(
                        name: "FK_TbmModules_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbmModules_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbmModules_TbmModules_ParentModuleId",
                        column: x => x.ParentModuleId,
                        principalTable: "TbmModules",
                        principalColumn: "ModuleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbmPermissions",
                columns: table => new
                {
                    PermissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PermissionName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PermissionCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_TbmPermissions", x => x.PermissionId);
                    table.ForeignKey(
                        name: "FK_TbmPermissions_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbmPermissions_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbmPositions",
                columns: table => new
                {
                    PositionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PositionName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
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
                    table.PrimaryKey("PK_TbmPositions", x => x.PositionId);
                    table.ForeignKey(
                        name: "FK_TbmPositions_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbmPositions_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbmAuthorizeMatrices",
                columns: table => new
                {
                    AuthorizeMatrixId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ModuleId = table.Column<int>(type: "int", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    PermissionPath = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_TbmAuthorizeMatrices", x => x.AuthorizeMatrixId);
                    table.ForeignKey(
                        name: "FK_TbmAuthorizeMatrices_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbmAuthorizeMatrices_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbmAuthorizeMatrices_TbmModules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "TbmModules",
                        principalColumn: "ModuleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbmAuthorizeMatrices_TbmPermissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "TbmPermissions",
                        principalColumn: "PermissionId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbAuthorizeMatrixPositions",
                columns: table => new
                {
                    AuthMatrixPositionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AuthorizeMatrixId = table.Column<int>(type: "int", nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_TbAuthorizeMatrixPositions", x => x.AuthMatrixPositionId);
                    table.ForeignKey(
                        name: "FK_TbAuthorizeMatrixPositions_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbAuthorizeMatrixPositions_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbAuthorizeMatrixPositions_TbmAuthorizeMatrices_AuthorizeMatrixId",
                        column: x => x.AuthorizeMatrixId,
                        principalTable: "TbmAuthorizeMatrices",
                        principalColumn: "AuthorizeMatrixId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbAuthorizeMatrixPositions_TbmPositions_PositionId",
                        column: x => x.PositionId,
                        principalTable: "TbmPositions",
                        principalColumn: "PositionId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "IsActive", "ModuleCode", "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "dashboard", "แดชบอร์ด", null, 1, null, null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "admin-settings", "ตั้งค่าระบบ", null, 2, null, null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "human-resource", "ทรัพยากรบุคคล", null, 3, null, null },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "menu", "เมนู", null, 4, null, null },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "order", "ออเดอร์", null, 5, null, null },
                    { 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "table", "โต๊ะ", null, 6, null, null },
                    { 7, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "payment", "ชำระเงิน", null, 7, null, null },
                    { 8, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "kitchen-display", "ครัว", null, 8, null, null }
                });

            migrationBuilder.InsertData(
                table: "TbmPermissions",
                columns: new[] { "PermissionId", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "PermissionCode", "PermissionName", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "read", "แสดง", 1, null, null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "create", "เพิ่ม", 2, null, null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "update", "แก้ไข", 3, null, null },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "delete", "ลบ", 4, null, null }
                });

            migrationBuilder.InsertData(
                table: "TbmPositions",
                columns: new[] { "PositionId", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "Description", "IsActive", "PositionName", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "ดูแลระบบทั้งหมด สิทธิ์เข้าถึงทุกฟังก์ชัน", true, "ผู้ดูแลระบบ", null, null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "จัดการร้านค้า ดูรายงาน จัดการพนักงาน", true, "ผู้จัดการ", null, null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, "รับออเดอร์ ชำระเงิน", true, "แคชเชียร์", null, null }
                });

            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "IsActive", "ModuleCode", "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 9, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "dashboard.view", "Dashboard", 1, 1, null, null },
                    { 10, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "service-charge", "Service Charge", 2, 1, null, null },
                    { 11, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "position", "จัดการตำแหน่ง", 2, 2, null, null },
                    { 12, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "employee", "จัดการพนักงาน", 3, 1, null, null },
                    { 13, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "menu-item", "จัดการเมนู", 4, 1, null, null },
                    { 14, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "order-manage", "จัดการออเดอร์", 5, 1, null, null },
                    { 15, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "table-manage", "จัดการโต๊ะ", 6, 1, null, null },
                    { 16, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "payment-manage", "ชำระเงิน", 7, 1, null, null },
                    { 17, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "kitchen-order", "แสดงออเดอร์ครัว", 8, 1, null, null }
                });

            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 9, 1, "dashboard.view.read", null, null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 10, 1, "service-charge.read", null, null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 10, 2, "service-charge.create", null, null },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 10, 3, "service-charge.update", null, null },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 10, 4, "service-charge.delete", null, null },
                    { 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 11, 1, "position.read", null, null },
                    { 7, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 11, 2, "position.create", null, null },
                    { 8, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 11, 3, "position.update", null, null },
                    { 9, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 11, 4, "position.delete", null, null },
                    { 10, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 12, 1, "employee.read", null, null },
                    { 11, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 12, 2, "employee.create", null, null },
                    { 12, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 12, 3, "employee.update", null, null },
                    { 13, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 12, 4, "employee.delete", null, null },
                    { 14, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 13, 1, "menu-item.read", null, null },
                    { 15, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 13, 2, "menu-item.create", null, null },
                    { 16, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 13, 3, "menu-item.update", null, null },
                    { 17, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 13, 4, "menu-item.delete", null, null },
                    { 18, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 14, 1, "order-manage.read", null, null },
                    { 19, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 14, 2, "order-manage.create", null, null },
                    { 20, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 14, 3, "order-manage.update", null, null },
                    { 21, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 14, 4, "order-manage.delete", null, null },
                    { 22, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 15, 1, "table-manage.read", null, null },
                    { 23, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 15, 2, "table-manage.create", null, null },
                    { 24, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 15, 3, "table-manage.update", null, null },
                    { 25, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 15, 4, "table-manage.delete", null, null },
                    { 26, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 16, 1, "payment-manage.read", null, null },
                    { 27, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 16, 2, "payment-manage.create", null, null },
                    { 28, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 16, 3, "payment-manage.update", null, null },
                    { 29, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 16, 4, "payment-manage.delete", null, null },
                    { 30, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 17, 1, "kitchen-order.read", null, null },
                    { 31, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 17, 3, "kitchen-order.update", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_PositionId",
                table: "TbEmployees",
                column: "PositionId");

            migrationBuilder.CreateIndex(
                name: "IX_TbAuthMatrixPositions_DeleteFlag",
                table: "TbAuthorizeMatrixPositions",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_TbAuthMatrixPositions_Matrix_Position",
                table: "TbAuthorizeMatrixPositions",
                columns: new[] { "AuthorizeMatrixId", "PositionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbAuthMatrixPositions_PositionId",
                table: "TbAuthorizeMatrixPositions",
                column: "PositionId");

            migrationBuilder.CreateIndex(
                name: "IX_TbAuthorizeMatrixPositions_CreatedBy",
                table: "TbAuthorizeMatrixPositions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbAuthorizeMatrixPositions_UpdatedBy",
                table: "TbAuthorizeMatrixPositions",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbmAuthorizeMatrices_CreatedBy",
                table: "TbmAuthorizeMatrices",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbmAuthorizeMatrices_DeleteFlag",
                table: "TbmAuthorizeMatrices",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_TbmAuthorizeMatrices_Module_Permission",
                table: "TbmAuthorizeMatrices",
                columns: new[] { "ModuleId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbmAuthorizeMatrices_PermissionId",
                table: "TbmAuthorizeMatrices",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_TbmAuthorizeMatrices_PermissionPath",
                table: "TbmAuthorizeMatrices",
                column: "PermissionPath",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbmAuthorizeMatrices_UpdatedBy",
                table: "TbmAuthorizeMatrices",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbmModules_CreatedBy",
                table: "TbmModules",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbmModules_DeleteFlag",
                table: "TbmModules",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_TbmModules_ModuleCode",
                table: "TbmModules",
                column: "ModuleCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbmModules_ParentModuleId",
                table: "TbmModules",
                column: "ParentModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_TbmModules_UpdatedBy",
                table: "TbmModules",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbmPermissions_CreatedBy",
                table: "TbmPermissions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbmPermissions_DeleteFlag",
                table: "TbmPermissions",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_TbmPermissions_PermissionCode",
                table: "TbmPermissions",
                column: "PermissionCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbmPermissions_UpdatedBy",
                table: "TbmPermissions",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbmPositions_CreatedBy",
                table: "TbmPositions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbmPositions_DeleteFlag",
                table: "TbmPositions",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_TbmPositions_IsActive",
                table: "TbmPositions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TbmPositions_PositionName",
                table: "TbmPositions",
                column: "PositionName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbmPositions_UpdatedBy",
                table: "TbmPositions",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_TbEmployees_TbmPositions_PositionId",
                table: "TbEmployees",
                column: "PositionId",
                principalTable: "TbmPositions",
                principalColumn: "PositionId",
                onDelete: ReferentialAction.Restrict);

            // Seed TbAuthorizeMatrixPositions — Position "ผู้ดูแลระบบ" (PositionId=1) gets ALL 31 permissions
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [TbAuthorizeMatrixPositions] ON;
                INSERT INTO [TbAuthorizeMatrixPositions]
                    ([AuthMatrixPositionId], [AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT v.[Id], v.[Id], 1, '2025-01-01T00:00:00Z', 0
                FROM (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),
                             (17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),(31)) AS v([Id]);
                SET IDENTITY_INSERT [TbAuthorizeMatrixPositions] OFF;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM [TbAuthorizeMatrixPositions];");

            migrationBuilder.DropForeignKey(
                name: "FK_TbEmployees_TbmPositions_PositionId",
                table: "TbEmployees");

            migrationBuilder.DropTable(
                name: "TbAuthorizeMatrixPositions");

            migrationBuilder.DropTable(
                name: "TbmAuthorizeMatrices");

            migrationBuilder.DropTable(
                name: "TbmPositions");

            migrationBuilder.DropTable(
                name: "TbmModules");

            migrationBuilder.DropTable(
                name: "TbmPermissions");

            migrationBuilder.DropIndex(
                name: "IX_Employees_PositionId",
                table: "TbEmployees");

            migrationBuilder.DropColumn(
                name: "PositionId",
                table: "TbEmployees");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "TbUsers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "JobPosition",
                table: "TbEmployees",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "TbUsers",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "Role",
                value: "Admin");

            migrationBuilder.UpdateData(
                table: "TbUsers",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"),
                column: "Role",
                value: "Manager");

            migrationBuilder.UpdateData(
                table: "TbUsers",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"),
                column: "Role",
                value: "Cashier");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Role",
                table: "TbUsers",
                column: "Role");
        }
    }
}
