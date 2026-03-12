using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class StandardizeEntitySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ====================================================================
            // Step 1: Clear string values in CreatedBy/UpdatedBy before type change
            // ====================================================================
            migrationBuilder.Sql("UPDATE [Users] SET [CreatedBy] = NULL, [UpdatedBy] = NULL");
            migrationBuilder.Sql("UPDATE [Employees] SET [CreatedBy] = NULL, [UpdatedBy] = NULL");
            migrationBuilder.Sql("UPDATE [Menus] SET [CreatedBy] = NULL, [UpdatedBy] = NULL");
            migrationBuilder.Sql("UPDATE [ServiceCharges] SET [CreatedBy] = NULL, [UpdatedBy] = NULL");

            // ====================================================================
            // Step 2: Rename IsDeleted → DeleteFlag (preserve existing data)
            // ====================================================================
            migrationBuilder.DropIndex(
                name: "IX_ServiceCharges_IsDeleted",
                table: "ServiceCharges");

            migrationBuilder.DropIndex(
                name: "IX_Menus_IsDeleted",
                table: "Menus");

            migrationBuilder.DropIndex(
                name: "IX_Employees_IsDeleted",
                table: "Employees");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "ServiceCharges",
                newName: "DeleteFlag");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Menus",
                newName: "DeleteFlag");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Employees",
                newName: "DeleteFlag");

            // ====================================================================
            // Step 3: Alter CreatedBy/UpdatedBy from nvarchar to int (all tables)
            // ====================================================================

            // -- Users --
            migrationBuilder.AlterColumn<int>(
                name: "UpdatedBy",
                table: "Users",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "Users",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            // -- ServiceCharges --
            migrationBuilder.AlterColumn<int>(
                name: "UpdatedBy",
                table: "ServiceCharges",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "ServiceCharges",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            // -- Menus --
            migrationBuilder.AlterColumn<int>(
                name: "UpdatedBy",
                table: "Menus",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "Menus",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            // -- Employees --
            migrationBuilder.AlterColumn<int>(
                name: "UpdatedBy",
                table: "Employees",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "Employees",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            // ====================================================================
            // Step 4: Add new columns (DeleteFlag for Users, DeletedAt/DeletedBy for all)
            // ====================================================================
            migrationBuilder.AddColumn<bool>(
                name: "DeleteFlag",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedBy",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ServiceCharges",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedBy",
                table: "ServiceCharges",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Menus",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedBy",
                table: "Menus",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Employees",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedBy",
                table: "Employees",
                type: "int",
                nullable: true);

            // ====================================================================
            // Step 5: Update seed data
            // ====================================================================
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "DeleteFlag", "DeletedAt", "DeletedBy", "UpdatedAt" },
                values: new object[] { false, null, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"),
                columns: new[] { "DeleteFlag", "DeletedAt", "DeletedBy", "UpdatedAt" },
                values: new object[] { false, null, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"),
                columns: new[] { "DeleteFlag", "DeletedAt", "DeletedBy", "UpdatedAt" },
                values: new object[] { false, null, null, null });

            // ====================================================================
            // Step 6: Create new indexes
            // ====================================================================
            migrationBuilder.CreateIndex(
                name: "IX_ServiceCharges_DeleteFlag",
                table: "ServiceCharges",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_Menus_DeleteFlag",
                table: "Menus",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DeleteFlag",
                table: "Employees",
                column: "DeleteFlag");

            // Update Employee-User relationship to 1:1 (unique index)
            migrationBuilder.DropIndex(
                name: "IX_Employees_UserId",
                table: "Employees");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserId",
                table: "Employees",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop new indexes
            migrationBuilder.DropIndex(
                name: "IX_ServiceCharges_DeleteFlag",
                table: "ServiceCharges");

            migrationBuilder.DropIndex(
                name: "IX_Menus_DeleteFlag",
                table: "Menus");

            migrationBuilder.DropIndex(
                name: "IX_Employees_DeleteFlag",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_UserId",
                table: "Employees");

            // Remove new columns from Users
            migrationBuilder.DropColumn(
                name: "DeleteFlag",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Users");

            // Remove DeletedAt/DeletedBy from other tables
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ServiceCharges");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "ServiceCharges");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Employees");

            // Rename DeleteFlag back to IsDeleted
            migrationBuilder.RenameColumn(
                name: "DeleteFlag",
                table: "ServiceCharges",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "DeleteFlag",
                table: "Menus",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "DeleteFlag",
                table: "Employees",
                newName: "IsDeleted");

            // Revert CreatedBy/UpdatedBy from int to nvarchar
            migrationBuilder.AlterColumn<string>(
                name: "UpdatedBy",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedBy",
                table: "ServiceCharges",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "ServiceCharges",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedBy",
                table: "Menus",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "Menus",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedBy",
                table: "Employees",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "Employees",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            // Restore seed data
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedBy", "UpdatedAt", "UpdatedBy" },
                values: new object[] { "System", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedBy", "UpdatedAt", "UpdatedBy" },
                values: new object[] { "System", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedBy", "UpdatedAt", "UpdatedBy" },
                values: new object[] { "System", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            // Recreate old indexes
            migrationBuilder.CreateIndex(
                name: "IX_ServiceCharges_IsDeleted",
                table: "ServiceCharges",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Menus_IsDeleted",
                table: "Menus",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_IsDeleted",
                table: "Employees",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserId",
                table: "Employees",
                column: "UserId");
        }
    }
}
