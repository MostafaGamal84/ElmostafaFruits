using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class ElMostafaPortfolioV1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admin_verification_codes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    code_hash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    attempt_count = table.Column<int>(type: "int", nullable: false),
                    requested_ip = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    expires_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "DATEADD(minute, 10, SYSDATETIMEOFFSET())"),
                    created_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()"),
                    used_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin_verification_codes", x => x.id);
                    table.ForeignKey(
                        name: "FK_admin_verification_codes_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    subject = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    summary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messages", x => x.id);
                    table.CheckConstraint("CK_messages_status", "[status] IN ('New', 'Read')");
                });

            migrationBuilder.CreateTable(
                name: "origins",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    flag = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    country_ar = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    focus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    featured_items = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()"),
                    updated_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_origins", x => x.id);
                    table.CheckConstraint("CK_origins_status", "[status] IN ('Draft', 'Live', 'Active', 'Seasonal', 'Review')");
                });

            migrationBuilder.CreateTable(
                name: "showcase_products",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    name_ar = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    category = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    image_filter = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    origin = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    varieties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description_ar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()"),
                    updated_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_showcase_products", x => x.id);
                    table.CheckConstraint("CK_showcase_products_category", "[category] IN ('tropical', 'stone', 'citrus', 'exotic')");
                    table.CheckConstraint("CK_showcase_products_origin_json", "ISJSON([origin]) = 1");
                    table.CheckConstraint("CK_showcase_products_status", "[status] IN ('Draft', 'Live', 'Active', 'Seasonal', 'Review')");
                    table.CheckConstraint("CK_showcase_products_varieties_json", "ISJSON([varieties]) = 1");
                });

            migrationBuilder.CreateTable(
                name: "site_content",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false),
                    configuration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_site_content", x => x.id);
                    table.CheckConstraint("CK_site_content_configuration_json", "ISJSON([configuration]) = 1");
                    table.CheckConstraint("CK_site_content_single_row", "[id] = 1");
                });

            migrationBuilder.CreateTable(
                name: "visual_overrides",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    node_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    scope = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()"),
                    updated_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_visual_overrides", x => x.id);
                    table.CheckConstraint("CK_visual_overrides_scope", "[scope] IN ('en', 'ar', 'global')");
                    table.CheckConstraint("CK_visual_overrides_type", "[type] IN ('text', 'textarea', 'html', 'image')");
                });

            migrationBuilder.CreateIndex(
                name: "IX_admin_verification_codes_email_expires_at",
                table: "admin_verification_codes",
                columns: new[] { "email", "expires_at" });

            migrationBuilder.CreateIndex(
                name: "IX_admin_verification_codes_user_id",
                table: "admin_verification_codes",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_messages_status",
                table: "messages",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_showcase_products_status",
                table: "showcase_products",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_visual_overrides_node_id_scope",
                table: "visual_overrides",
                columns: new[] { "node_id", "scope" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_visual_overrides_scope",
                table: "visual_overrides",
                column: "scope");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_verification_codes");

            migrationBuilder.DropTable(
                name: "messages");

            migrationBuilder.DropTable(
                name: "origins");

            migrationBuilder.DropTable(
                name: "showcase_products");

            migrationBuilder.DropTable(
                name: "site_content");

            migrationBuilder.DropTable(
                name: "visual_overrides");
        }
    }
}
