using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Main.Dal.Migrations
{
    /// <inheritdoc />
    public partial class AddLinkTableMergeOrderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPrimary",
                table: "TbTableLinks",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "SourceTableId",
                table: "TbOrderItems",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_SourceTableId",
                table: "TbOrderItems",
                column: "SourceTableId");

            migrationBuilder.AddForeignKey(
                name: "FK_TbOrderItems_TbTables_SourceTableId",
                table: "TbOrderItems",
                column: "SourceTableId",
                principalTable: "TbTables",
                principalColumn: "TableId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TbOrderItems_TbTables_SourceTableId",
                table: "TbOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_SourceTableId",
                table: "TbOrderItems");

            migrationBuilder.DropColumn(
                name: "IsPrimary",
                table: "TbTableLinks");

            migrationBuilder.DropColumn(
                name: "SourceTableId",
                table: "TbOrderItems");
        }
    }
}
