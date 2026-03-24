using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class SeedReservationPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =============================================
            // 1. เพิ่ม Module: reservation (child ของ table=6)
            // =============================================
            migrationBuilder.InsertData(
                table: "TbmModules",
                columns: new[] { "ModuleId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "IsActive", "ModuleCode",
                    "ModuleName", "ParentModuleId", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[]
                {
                    25, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                    false, null, null, true, "reservation", "การจอง", 6, 2, null, null
                });

            // =============================================
            // 2. เพิ่ม 4 AuthorizeMatrix entries (reservation.read/create/update/delete)
            // =============================================
            migrationBuilder.InsertData(
                table: "TbmAuthorizeMatrices",
                columns: new[] { "AuthorizeMatrixId", "CreatedAt", "CreatedBy", "DeleteFlag",
                    "DeletedAt", "DeletedBy", "ModuleId", "PermissionId", "PermissionPath",
                    "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 56, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 25, 1, "reservation.read", null, null },
                    { 57, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 25, 2, "reservation.create", null, null },
                    { 58, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 25, 3, "reservation.update", null, null },
                    { 59, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null,
                      false, null, null, 25, 4, "reservation.delete", null, null }
                });

            // =============================================
            // 3. Grant: ตำแหน่งที่มี table-manage.* ให้ได้ reservation.* ด้วย
            // =============================================

            // table-manage.read (AM=22) → reservation.read (AM=56)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 56, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 22 AND [DeleteFlag] = 0;
            ");

            // table-manage.create (AM=23) → reservation.create (AM=57)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 57, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 23 AND [DeleteFlag] = 0;
            ");

            // table-manage.update (AM=24) → reservation.update (AM=58)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 58, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 24 AND [DeleteFlag] = 0;
            ");

            // table-manage.delete (AM=25) → reservation.delete (AM=59)
            migrationBuilder.Sql(@"
                INSERT INTO [TbAuthorizeMatrixPositions] ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
                SELECT 59, [PositionId], GETUTCDATE(), 0 FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] = 25 AND [DeleteFlag] = 0;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // ลบ permission grants
            migrationBuilder.Sql(@"
                DELETE FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] IN (56, 57, 58, 59);
            ");

            // ลบ AuthorizeMatrix entries
            migrationBuilder.DeleteData(
                table: "TbmAuthorizeMatrices",
                keyColumn: "AuthorizeMatrixId",
                keyValues: new object[] { 56, 57, 58, 59 });

            // ลบ Module
            migrationBuilder.DeleteData(
                table: "TbmModules",
                keyColumn: "ModuleId",
                keyValue: 25);
        }
    }
}
