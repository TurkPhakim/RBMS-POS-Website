using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddShopSettingsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TbShopSettings",
                columns: table => new
                {
                    ShopSettingsId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShopNameThai = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ShopNameEnglish = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CompanyNameThai = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CompanyNameEnglish = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TaxId = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: false),
                    FoodType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    LogoFileId = table.Column<int>(type: "int", nullable: true),
                    HasTwoPeriods = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Address = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Facebook = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Instagram = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LineId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentQrCodeFileId = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_TbShopSettings", x => x.ShopSettingsId);
                    table.ForeignKey(
                        name: "FK_TbShopSettings_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbShopSettings_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbShopSettings_TbFiles_LogoFileId",
                        column: x => x.LogoFileId,
                        principalTable: "TbFiles",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbShopSettings_TbFiles_PaymentQrCodeFileId",
                        column: x => x.PaymentQrCodeFileId,
                        principalTable: "TbFiles",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TbShopOperatingHours",
                columns: table => new
                {
                    ShopOperatingHourId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShopSettingsId = table.Column<int>(type: "int", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    IsOpen = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    OpenTime1 = table.Column<TimeSpan>(type: "time", nullable: true),
                    CloseTime1 = table.Column<TimeSpan>(type: "time", nullable: true),
                    OpenTime2 = table.Column<TimeSpan>(type: "time", nullable: true),
                    CloseTime2 = table.Column<TimeSpan>(type: "time", nullable: true),
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
                    table.PrimaryKey("PK_TbShopOperatingHours", x => x.ShopOperatingHourId);
                    table.ForeignKey(
                        name: "FK_TbShopOperatingHours_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbShopOperatingHours_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbShopOperatingHours_TbShopSettings_ShopSettingsId",
                        column: x => x.ShopSettingsId,
                        principalTable: "TbShopSettings",
                        principalColumn: "ShopSettingsId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "TbShopSettings",
                columns: new[] { "ShopSettingsId", "Address", "CompanyNameEnglish", "CompanyNameThai", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "Description", "Facebook", "FoodType", "Instagram", "LineId", "LogoFileId", "PaymentQrCodeFileId", "PhoneNumber", "ShopNameEnglish", "ShopNameThai", "TaxId", "UpdatedAt", "UpdatedBy", "Website" },
                values: new object[] { 1, "", null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, null, null, "", null, null, null, null, "", "", "", "", null, null, null });

            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "IsActive", "ModuleCode", "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[] { 18, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, true, "shop-settings", "ตั้งค่าร้านค้า", 2, 3, null, null });

            migrationBuilder.InsertData(
                table: "TbShopOperatingHours",
                columns: new[] { "ShopOperatingHourId", "CloseTime1", "CloseTime2", "CreatedAt", "CreatedBy", "DayOfWeek", "DeleteFlag", "DeletedAt", "DeletedBy", "OpenTime1", "OpenTime2", "ShopSettingsId", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1, null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 1, false, null, null, null, null, 1, null, null },
                    { 2, null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, false, null, null, null, null, 1, null, null },
                    { 3, null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 3, false, null, null, null, null, 1, null, null },
                    { 4, null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 4, false, null, null, null, null, 1, null, null },
                    { 5, null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 5, false, null, null, null, null, 1, null, null },
                    { 6, null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 6, false, null, null, null, null, 1, null, null },
                    { 7, null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 7, false, null, null, null, null, 1, null, null }
                });

            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag", "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 32, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 18, 1, "shop-settings.read", null, null },
                    { 33, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 18, 3, "shop-settings.update", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShopOperatingHours_DeleteFlag",
                table: "TbShopOperatingHours",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_ShopOperatingHours_Settings_Day",
                table: "TbShopOperatingHours",
                columns: new[] { "ShopSettingsId", "DayOfWeek" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShopOperatingHours_ShopSettingsId",
                table: "TbShopOperatingHours",
                column: "ShopSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_TbShopOperatingHours_CreatedBy",
                table: "TbShopOperatingHours",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbShopOperatingHours_UpdatedBy",
                table: "TbShopOperatingHours",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ShopSettings_DeleteFlag",
                table: "TbShopSettings",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_ShopSettings_LogoFileId",
                table: "TbShopSettings",
                column: "LogoFileId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopSettings_PaymentQrCodeFileId",
                table: "TbShopSettings",
                column: "PaymentQrCodeFileId");

            migrationBuilder.CreateIndex(
                name: "IX_TbShopSettings_CreatedBy",
                table: "TbShopSettings",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbShopSettings_UpdatedBy",
                table: "TbShopSettings",
                column: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TbShopOperatingHours");

            migrationBuilder.DropTable(
                name: "TbShopSettings");

            migrationBuilder.DeleteData(
                table: "TbmAuthorizeMatrices",
                keyColumn: "AuthorizeMatrixId",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "TbmAuthorizeMatrices",
                keyColumn: "AuthorizeMatrixId",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValue: 18);
        }
    }
}
