using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class StandardizeNamingConvention : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Users_UserId",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginHistory_Users_UserId",
                table: "LoginHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_RefreshTokens_Users_UserId",
                table: "RefreshTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ServiceCharges",
                table: "ServiceCharges");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshTokens",
                table: "RefreshTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Menus",
                table: "Menus");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LoginHistory",
                table: "LoginHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Employees",
                table: "Employees");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "TbUsers");

            migrationBuilder.RenameTable(
                name: "ServiceCharges",
                newName: "TbServiceCharges");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                newName: "TbRefreshTokens");

            migrationBuilder.RenameTable(
                name: "Menus",
                newName: "TbMenus");

            migrationBuilder.RenameTable(
                name: "LoginHistory",
                newName: "TbLoginHistory");

            migrationBuilder.RenameTable(
                name: "Employees",
                newName: "TbEmployees");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "TbUsers",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "TbServiceCharges",
                newName: "ServiceChargeId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "TbRefreshTokens",
                newName: "RefreshTokenId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "TbMenus",
                newName: "MenuId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "TbLoginHistory",
                newName: "LoginHistoryId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "TbEmployees",
                newName: "EmployeeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TbUsers",
                table: "TbUsers",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TbServiceCharges",
                table: "TbServiceCharges",
                column: "ServiceChargeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TbRefreshTokens",
                table: "TbRefreshTokens",
                column: "RefreshTokenId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TbMenus",
                table: "TbMenus",
                column: "MenuId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TbLoginHistory",
                table: "TbLoginHistory",
                column: "LoginHistoryId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TbEmployees",
                table: "TbEmployees",
                column: "EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_TbEmployees_TbUsers_UserId",
                table: "TbEmployees",
                column: "UserId",
                principalTable: "TbUsers",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbLoginHistory_TbUsers_UserId",
                table: "TbLoginHistory",
                column: "UserId",
                principalTable: "TbUsers",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbRefreshTokens_TbUsers_UserId",
                table: "TbRefreshTokens",
                column: "UserId",
                principalTable: "TbUsers",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TbEmployees_TbUsers_UserId",
                table: "TbEmployees");

            migrationBuilder.DropForeignKey(
                name: "FK_TbLoginHistory_TbUsers_UserId",
                table: "TbLoginHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_TbRefreshTokens_TbUsers_UserId",
                table: "TbRefreshTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TbUsers",
                table: "TbUsers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TbServiceCharges",
                table: "TbServiceCharges");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TbRefreshTokens",
                table: "TbRefreshTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TbMenus",
                table: "TbMenus");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TbLoginHistory",
                table: "TbLoginHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TbEmployees",
                table: "TbEmployees");

            migrationBuilder.RenameTable(
                name: "TbUsers",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "TbServiceCharges",
                newName: "ServiceCharges");

            migrationBuilder.RenameTable(
                name: "TbRefreshTokens",
                newName: "RefreshTokens");

            migrationBuilder.RenameTable(
                name: "TbMenus",
                newName: "Menus");

            migrationBuilder.RenameTable(
                name: "TbLoginHistory",
                newName: "LoginHistory");

            migrationBuilder.RenameTable(
                name: "TbEmployees",
                newName: "Employees");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Users",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "ServiceChargeId",
                table: "ServiceCharges",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "RefreshTokenId",
                table: "RefreshTokens",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "MenuId",
                table: "Menus",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "LoginHistoryId",
                table: "LoginHistory",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "EmployeeId",
                table: "Employees",
                newName: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ServiceCharges",
                table: "ServiceCharges",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshTokens",
                table: "RefreshTokens",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Menus",
                table: "Menus",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LoginHistory",
                table: "LoginHistory",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Employees",
                table: "Employees",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Users_UserId",
                table: "Employees",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_LoginHistory_Users_UserId",
                table: "LoginHistory",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshTokens_Users_UserId",
                table: "RefreshTokens",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
