using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NewApi.Migrations
{
    /// <inheritdoc />
    public partial class NewCmsFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cms_content_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    node_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    scope = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    draft_value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    published_value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()"),
                    published_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cms_content_entries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "cms_media_assets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    file_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    original_file_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    folder = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    content_type = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    size = table.Column<long>(type: "bigint", nullable: false),
                    width = table.Column<int>(type: "int", nullable: false),
                    height = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cms_media_assets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "cms_site_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    key = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    draft_value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    published_value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()"),
                    published_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cms_site_settings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cms_content_entries_node_id_scope",
                table: "cms_content_entries",
                columns: new[] { "node_id", "scope" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_cms_media_assets_created_at",
                table: "cms_media_assets",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_cms_media_assets_folder",
                table: "cms_media_assets",
                column: "folder");

            migrationBuilder.CreateIndex(
                name: "IX_cms_site_settings_key",
                table: "cms_site_settings",
                column: "key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cms_content_entries");

            migrationBuilder.DropTable(
                name: "cms_media_assets");

            migrationBuilder.DropTable(
                name: "cms_site_settings");
        }
    }
}
