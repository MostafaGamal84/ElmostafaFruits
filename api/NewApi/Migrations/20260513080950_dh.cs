using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NewApi.Migrations
{
    /// <inheritdoc />
    public partial class dh : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "latitude",
                table: "origins",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "longitude",
                table: "origins",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "latitude",
                table: "origins");

            migrationBuilder.DropColumn(
                name: "longitude",
                table: "origins");
        }
    }
}
