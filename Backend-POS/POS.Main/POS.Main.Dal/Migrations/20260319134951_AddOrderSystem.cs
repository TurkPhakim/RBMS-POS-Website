using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActiveOrderId",
                table: "TbTables",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TbOrders",
                columns: table => new
                {
                    OrderId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableId = table.Column<int>(type: "int", nullable: false),
                    OrderNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Open"),
                    GuestCount = table.Column<int>(type: "int", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(12,2)", nullable: false, defaultValue: 0m),
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
                    table.PrimaryKey("PK_TbOrders", x => x.OrderId);
                    table.ForeignKey(
                        name: "FK_TbOrders_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrders_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrders_TbTables_TableId",
                        column: x => x.TableId,
                        principalTable: "TbTables",
                        principalColumn: "TableId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbOrderBills",
                columns: table => new
                {
                    OrderBillId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    BillNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BillType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Full"),
                    SubTotal = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    TotalDiscountAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false, defaultValue: 0m),
                    NetAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    ServiceChargeRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ServiceChargeAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    VatRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    VatAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_TbOrderBills", x => x.OrderBillId);
                    table.ForeignKey(
                        name: "FK_TbOrderBills_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrderBills_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrderBills_TbOrders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "TbOrders",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbOrderItems",
                columns: table => new
                {
                    OrderItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    MenuId = table.Column<int>(type: "int", nullable: false),
                    MenuNameThai = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MenuNameEnglish = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CategoryType = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    OptionsTotalPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 0m),
                    TotalPrice = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OrderedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SentToKitchenAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CookingStartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReadyAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ServedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledBy = table.Column<int>(type: "int", nullable: true),
                    CancelReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CostPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
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
                    table.PrimaryKey("PK_TbOrderItems", x => x.OrderItemId);
                    table.ForeignKey(
                        name: "FK_TbOrderItems_TbEmployees_CancelledBy",
                        column: x => x.CancelledBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrderItems_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrderItems_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrderItems_TbMenus_MenuId",
                        column: x => x.MenuId,
                        principalTable: "TbMenus",
                        principalColumn: "MenuId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrderItems_TbOrders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "TbOrders",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbOrderItemOptions",
                columns: table => new
                {
                    OrderItemOptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderItemId = table.Column<int>(type: "int", nullable: false),
                    OptionGroupId = table.Column<int>(type: "int", nullable: false),
                    OptionItemId = table.Column<int>(type: "int", nullable: false),
                    OptionGroupName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OptionItemName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AdditionalPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 0m)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TbOrderItemOptions", x => x.OrderItemOptionId);
                    table.ForeignKey(
                        name: "FK_TbOrderItemOptions_TbOptionGroups_OptionGroupId",
                        column: x => x.OptionGroupId,
                        principalTable: "TbOptionGroups",
                        principalColumn: "OptionGroupId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrderItemOptions_TbOptionItems_OptionItemId",
                        column: x => x.OptionItemId,
                        principalTable: "TbOptionItems",
                        principalColumn: "OptionItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbOrderItemOptions_TbOrderItems_OrderItemId",
                        column: x => x.OrderItemId,
                        principalTable: "TbOrderItems",
                        principalColumn: "OrderItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TbTables_ActiveOrderId",
                table: "TbTables",
                column: "ActiveOrderId",
                unique: true,
                filter: "[ActiveOrderId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OrderBills_BillNumber",
                table: "TbOrderBills",
                column: "BillNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderBills_DeleteFlag",
                table: "TbOrderBills",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_OrderBills_OrderId",
                table: "TbOrderBills",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderBills_Status",
                table: "TbOrderBills",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderBills_CreatedBy",
                table: "TbOrderBills",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderBills_UpdatedBy",
                table: "TbOrderBills",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItemOptions_OrderItemId",
                table: "TbOrderItemOptions",
                column: "OrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderItemOptions_OptionGroupId",
                table: "TbOrderItemOptions",
                column: "OptionGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderItemOptions_OptionItemId",
                table: "TbOrderItemOptions",
                column: "OptionItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_CategoryType",
                table: "TbOrderItems",
                column: "CategoryType");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_DeleteFlag",
                table: "TbOrderItems",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_MenuId",
                table: "TbOrderItems",
                column: "MenuId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "TbOrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_Status",
                table: "TbOrderItems",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderItems_CancelledBy",
                table: "TbOrderItems",
                column: "CancelledBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderItems_CreatedBy",
                table: "TbOrderItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbOrderItems_UpdatedBy",
                table: "TbOrderItems",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CreatedAt",
                table: "TbOrders",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_DeleteFlag",
                table: "TbOrders",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderNumber",
                table: "TbOrders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Status",
                table: "TbOrders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TableId",
                table: "TbOrders",
                column: "TableId");

            migrationBuilder.CreateIndex(
                name: "IX_TbOrders_CreatedBy",
                table: "TbOrders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbOrders_UpdatedBy",
                table: "TbOrders",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_TbTables_TbOrders_ActiveOrderId",
                table: "TbTables",
                column: "ActiveOrderId",
                principalTable: "TbOrders",
                principalColumn: "OrderId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TbTables_TbOrders_ActiveOrderId",
                table: "TbTables");

            migrationBuilder.DropTable(
                name: "TbOrderBills");

            migrationBuilder.DropTable(
                name: "TbOrderItemOptions");

            migrationBuilder.DropTable(
                name: "TbOrderItems");

            migrationBuilder.DropTable(
                name: "TbOrders");

            migrationBuilder.DropIndex(
                name: "IX_TbTables_ActiveOrderId",
                table: "TbTables");

            migrationBuilder.DropColumn(
                name: "ActiveOrderId",
                table: "TbTables");
        }
    }
}
