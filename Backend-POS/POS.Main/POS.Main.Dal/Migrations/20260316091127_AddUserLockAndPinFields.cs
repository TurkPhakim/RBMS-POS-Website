using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLockAndPinFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AutoUnlockDate",
                table: "TbUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLockedByAdmin",
                table: "TbUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PinCodeHash",
                table: "TbUsers",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoUnlockDate",
                table: "TbUsers");

            migrationBuilder.DropColumn(
                name: "IsLockedByAdmin",
                table: "TbUsers");

            migrationBuilder.DropColumn(
                name: "PinCodeHash",
                table: "TbUsers");
        }
    }
}
