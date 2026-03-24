using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReceiptFooterText",
                table: "TbShopSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptHeaderText",
                table: "TbShopSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TbCashierSessions",
                columns: table => new
                {
                    CashierSessionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Open"),
                    OpenedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OpeningCash = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    ExpectedCash = table.Column<decimal>(type: "decimal(12,2)", nullable: false, defaultValue: 0m),
                    ActualCash = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    Variance = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    TotalCashSales = table.Column<decimal>(type: "decimal(12,2)", nullable: false, defaultValue: 0m),
                    TotalQrSales = table.Column<decimal>(type: "decimal(12,2)", nullable: false, defaultValue: 0m),
                    BillCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_TbCashierSessions", x => x.CashierSessionId);
                    table.ForeignKey(
                        name: "FK_TbCashierSessions_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbCashierSessions_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbCashierSessions_TbUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "TbUsers",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbCashDrawerTransactions",
                columns: table => new
                {
                    CashDrawerTransactionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CashierSessionId = table.Column<int>(type: "int", nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
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
                    table.PrimaryKey("PK_TbCashDrawerTransactions", x => x.CashDrawerTransactionId);
                    table.ForeignKey(
                        name: "FK_TbCashDrawerTransactions_TbCashierSessions_CashierSessionId",
                        column: x => x.CashierSessionId,
                        principalTable: "TbCashierSessions",
                        principalColumn: "CashierSessionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbCashDrawerTransactions_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbCashDrawerTransactions_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbPayments",
                columns: table => new
                {
                    PaymentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderBillId = table.Column<int>(type: "int", nullable: false),
                    CashierSessionId = table.Column<int>(type: "int", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AmountDue = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    AmountReceived = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    ChangeAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false, defaultValue: 0m),
                    SlipImageFileId = table.Column<int>(type: "int", nullable: true),
                    SlipOcrAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    SlipVerificationStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "None"),
                    PaymentReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_TbPayments", x => x.PaymentId);
                    table.ForeignKey(
                        name: "FK_TbPayments_TbCashierSessions_CashierSessionId",
                        column: x => x.CashierSessionId,
                        principalTable: "TbCashierSessions",
                        principalColumn: "CashierSessionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbPayments_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbPayments_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbPayments_TbFiles_SlipImageFileId",
                        column: x => x.SlipImageFileId,
                        principalTable: "TbFiles",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbPayments_TbOrderBills_OrderBillId",
                        column: x => x.OrderBillId,
                        principalTable: "TbOrderBills",
                        principalColumn: "OrderBillId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "TbShopSettings",
                keyColumn: "ShopSettingsId",
                keyValue: 1,
                columns: new[] { "ReceiptFooterText", "ReceiptHeaderText" },
                values: new object[] { null, null });

            // Seed cashier-session module (child of ModuleId=7 "ชำระเงิน")
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[]
                {
                    31, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                    false, null, null, true, "cashier-session", "กะแคชเชียร์", 7, 2, null, null
                });

            // Seed cashier-session permissions (read, create, update)
            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath",
                    "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 74, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 31, 1, "cashier-session.read", null, null },
                    { 75, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 31, 2, "cashier-session.create", null, null },
                    { 76, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 31, 3, "cashier-session.update", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CashDrawerTransactions_CashierSessionId",
                table: "TbCashDrawerTransactions",
                column: "CashierSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_CashDrawerTransactions_DeleteFlag",
                table: "TbCashDrawerTransactions",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_TbCashDrawerTransactions_CreatedBy",
                table: "TbCashDrawerTransactions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbCashDrawerTransactions_UpdatedBy",
                table: "TbCashDrawerTransactions",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_CashierSessions_DeleteFlag",
                table: "TbCashierSessions",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_CashierSessions_OpenedAt",
                table: "TbCashierSessions",
                column: "OpenedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CashierSessions_Status",
                table: "TbCashierSessions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CashierSessions_UserId",
                table: "TbCashierSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TbCashierSessions_CreatedBy",
                table: "TbCashierSessions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbCashierSessions_UpdatedBy",
                table: "TbCashierSessions",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CashierSessionId",
                table: "TbPayments",
                column: "CashierSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_DeleteFlag",
                table: "TbPayments",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_OrderBillId",
                table: "TbPayments",
                column: "OrderBillId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaidAt",
                table: "TbPayments",
                column: "PaidAt");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentMethod",
                table: "TbPayments",
                column: "PaymentMethod");

            migrationBuilder.CreateIndex(
                name: "IX_TbPayments_CreatedBy",
                table: "TbPayments",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbPayments_SlipImageFileId",
                table: "TbPayments",
                column: "SlipImageFileId");

            migrationBuilder.CreateIndex(
                name: "IX_TbPayments_UpdatedBy",
                table: "TbPayments",
                column: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove cashier-session permissions and module
            migrationBuilder.DeleteData(
                table: "TbmAuthorizeMatrices",
                keyColumn: "AuthorizeMatrixId",
                keyValues: new object[] { 74, 75, 76 });

            migrationBuilder.DeleteData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValue: 31);

            migrationBuilder.DropTable(
                name: "TbCashDrawerTransactions");

            migrationBuilder.DropTable(
                name: "TbPayments");

            migrationBuilder.DropTable(
                name: "TbCashierSessions");

            migrationBuilder.DropColumn(
                name: "ReceiptFooterText",
                table: "TbShopSettings");

            migrationBuilder.DropColumn(
                name: "ReceiptHeaderText",
                table: "TbShopSettings");
        }
    }
}
