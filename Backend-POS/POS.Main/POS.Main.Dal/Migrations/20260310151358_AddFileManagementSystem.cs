using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddFileManagementSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "TbMenus");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "TbEmployees");

            migrationBuilder.AddColumn<int>(
                name: "ImageFileId",
                table: "TbMenus",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ImageFileId",
                table: "TbEmployees",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TbFiles",
                columns: table => new
                {
                    FileId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    S3Key = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
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
                    table.PrimaryKey("PK_TbFiles", x => x.FileId);
                    table.ForeignKey(
                        name: "FK_TbFiles_TbEmployees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TbFiles_TbEmployees_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "TbEmployees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TbUsers_CreatedBy",
                table: "TbUsers",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbUsers_UpdatedBy",
                table: "TbUsers",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Users_DeleteFlag",
                table: "TbUsers",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_TbServiceCharges_CreatedBy",
                table: "TbServiceCharges",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbServiceCharges_UpdatedBy",
                table: "TbServiceCharges",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbMenus_CreatedBy",
                table: "TbMenus",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbMenus_ImageFileId",
                table: "TbMenus",
                column: "ImageFileId");

            migrationBuilder.CreateIndex(
                name: "IX_TbMenus_UpdatedBy",
                table: "TbMenus",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbEmployees_CreatedBy",
                table: "TbEmployees",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbEmployees_ImageFileId",
                table: "TbEmployees",
                column: "ImageFileId");

            migrationBuilder.CreateIndex(
                name: "IX_TbEmployees_UpdatedBy",
                table: "TbEmployees",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbFiles_CreatedBy",
                table: "TbFiles",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TbFiles_DeleteFlag",
                table: "TbFiles",
                column: "DeleteFlag");

            migrationBuilder.CreateIndex(
                name: "IX_TbFiles_S3Key",
                table: "TbFiles",
                column: "S3Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TbFiles_UpdatedBy",
                table: "TbFiles",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_TbEmployees_TbEmployees_CreatedBy",
                table: "TbEmployees",
                column: "CreatedBy",
                principalTable: "TbEmployees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbEmployees_TbEmployees_UpdatedBy",
                table: "TbEmployees",
                column: "UpdatedBy",
                principalTable: "TbEmployees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbEmployees_TbFiles_ImageFileId",
                table: "TbEmployees",
                column: "ImageFileId",
                principalTable: "TbFiles",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbMenus_TbEmployees_CreatedBy",
                table: "TbMenus",
                column: "CreatedBy",
                principalTable: "TbEmployees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbMenus_TbEmployees_UpdatedBy",
                table: "TbMenus",
                column: "UpdatedBy",
                principalTable: "TbEmployees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbMenus_TbFiles_ImageFileId",
                table: "TbMenus",
                column: "ImageFileId",
                principalTable: "TbFiles",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbServiceCharges_TbEmployees_CreatedBy",
                table: "TbServiceCharges",
                column: "CreatedBy",
                principalTable: "TbEmployees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbServiceCharges_TbEmployees_UpdatedBy",
                table: "TbServiceCharges",
                column: "UpdatedBy",
                principalTable: "TbEmployees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbUsers_TbEmployees_CreatedBy",
                table: "TbUsers",
                column: "CreatedBy",
                principalTable: "TbEmployees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TbUsers_TbEmployees_UpdatedBy",
                table: "TbUsers",
                column: "UpdatedBy",
                principalTable: "TbEmployees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TbEmployees_TbEmployees_CreatedBy",
                table: "TbEmployees");

            migrationBuilder.DropForeignKey(
                name: "FK_TbEmployees_TbEmployees_UpdatedBy",
                table: "TbEmployees");

            migrationBuilder.DropForeignKey(
                name: "FK_TbEmployees_TbFiles_ImageFileId",
                table: "TbEmployees");

            migrationBuilder.DropForeignKey(
                name: "FK_TbMenus_TbEmployees_CreatedBy",
                table: "TbMenus");

            migrationBuilder.DropForeignKey(
                name: "FK_TbMenus_TbEmployees_UpdatedBy",
                table: "TbMenus");

            migrationBuilder.DropForeignKey(
                name: "FK_TbMenus_TbFiles_ImageFileId",
                table: "TbMenus");

            migrationBuilder.DropForeignKey(
                name: "FK_TbServiceCharges_TbEmployees_CreatedBy",
                table: "TbServiceCharges");

            migrationBuilder.DropForeignKey(
                name: "FK_TbServiceCharges_TbEmployees_UpdatedBy",
                table: "TbServiceCharges");

            migrationBuilder.DropForeignKey(
                name: "FK_TbUsers_TbEmployees_CreatedBy",
                table: "TbUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_TbUsers_TbEmployees_UpdatedBy",
                table: "TbUsers");

            migrationBuilder.DropTable(
                name: "TbFiles");

            migrationBuilder.DropIndex(
                name: "IX_TbUsers_CreatedBy",
                table: "TbUsers");

            migrationBuilder.DropIndex(
                name: "IX_TbUsers_UpdatedBy",
                table: "TbUsers");

            migrationBuilder.DropIndex(
                name: "IX_Users_DeleteFlag",
                table: "TbUsers");

            migrationBuilder.DropIndex(
                name: "IX_TbServiceCharges_CreatedBy",
                table: "TbServiceCharges");

            migrationBuilder.DropIndex(
                name: "IX_TbServiceCharges_UpdatedBy",
                table: "TbServiceCharges");

            migrationBuilder.DropIndex(
                name: "IX_TbMenus_CreatedBy",
                table: "TbMenus");

            migrationBuilder.DropIndex(
                name: "IX_TbMenus_ImageFileId",
                table: "TbMenus");

            migrationBuilder.DropIndex(
                name: "IX_TbMenus_UpdatedBy",
                table: "TbMenus");

            migrationBuilder.DropIndex(
                name: "IX_TbEmployees_CreatedBy",
                table: "TbEmployees");

            migrationBuilder.DropIndex(
                name: "IX_TbEmployees_ImageFileId",
                table: "TbEmployees");

            migrationBuilder.DropIndex(
                name: "IX_TbEmployees_UpdatedBy",
                table: "TbEmployees");

            migrationBuilder.DropColumn(
                name: "ImageFileId",
                table: "TbMenus");

            migrationBuilder.DropColumn(
                name: "ImageFileId",
                table: "TbEmployees");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "TbMenus",
                type: "NVARCHAR(MAX)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "TbEmployees",
                type: "NVARCHAR(MAX)",
                nullable: true);
        }
    }
}
