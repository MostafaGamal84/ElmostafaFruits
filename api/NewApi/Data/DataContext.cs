using API.Common.Localization;
using API.Entities;
using API.Modules.Catalog.Entities;
using API.Modules.Cms.Entities;
using API.Modules.Content.Entities;
using API.Modules.Leads.Entities;
using API.Modules.Network.Entities;
using API.Modules.Newsletter.Entities;
using API.Modules.Portfolio.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext : IdentityDbContext<AppUser, AppRole, int,
    IdentityUserClaim<int>, AppUserRole, IdentityUserLogin<int>,
    IdentityRoleClaim<int>, IdentityUserToken<int>>
{
    public DataContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();

    public DbSet<Article> Articles => Set<Article>();
    public DbSet<ArticleCategory> ArticleCategories => Set<ArticleCategory>();
    public DbSet<StaticPage> StaticPages => Set<StaticPage>();
    public DbSet<Milestone> Milestones => Set<Milestone>();

    public DbSet<Region> Regions => Set<Region>();
    public DbSet<Stat> Stats => Set<Stat>();

    public DbSet<QuoteRequest> QuoteRequests => Set<QuoteRequest>();
    public DbSet<NewsletterSubscriber> NewsletterSubscribers => Set<NewsletterSubscriber>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AuthVerificationCode> AuthVerificationCodes => Set<AuthVerificationCode>();
    public DbSet<ContentEntry> ContentEntries => Set<ContentEntry>();
    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<ShowcaseProduct> ShowcaseProducts => Set<ShowcaseProduct>();
    public DbSet<Origin> Origins => Set<Origin>();
    public DbSet<PublicMessage> PublicMessages => Set<PublicMessage>();
    public DbSet<SiteContent> SiteContents => Set<SiteContent>();
    public DbSet<VisualOverride> VisualOverrides => Set<VisualOverride>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder
            .Properties<TranslatedText>()
            .HaveConversion<TranslatedTextConverter, TranslatedTextComparer>()
            .HaveColumnType("nvarchar(max)");
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<AppUser>()
            .HasMany(ur => ur.UserRoles)
            .WithOne(u => u.User)
            .HasForeignKey(ur => ur.UserId)
            .IsRequired();

        builder.Entity<AppRole>()
            .HasMany(ur => ur.UserRoles)
            .WithOne(u => u.Role)
            .HasForeignKey(ur => ur.RoleId)
            .IsRequired();

        builder.Entity<RefreshToken>(b =>
        {
            b.HasIndex(x => x.Token).IsUnique();
            b.Property(x => x.Token).HasMaxLength(256).IsRequired();
            b.HasOne(x => x.User)
                .WithMany(x => x.RefreshTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        ConfigureCatalog(builder);
        ConfigureCms(builder);
        ConfigureContent(builder);
        ConfigureNetwork(builder);
        ConfigureLeads(builder);
        ConfigureNewsletter(builder);
        ConfigurePortfolio(builder);
    }

    private static void ConfigureCatalog(ModelBuilder builder)
    {
        builder.Entity<Category>(b =>
        {
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.Slug).HasMaxLength(160).IsRequired();
            b.Property(x => x.Icon).HasMaxLength(120);
        });

        builder.Entity<Product>(b =>
        {
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.Slug).HasMaxLength(160).IsRequired();
            b.HasOne(x => x.Category)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ProductImage>(b =>
        {
            b.Property(x => x.Url).HasMaxLength(500).IsRequired();
            b.HasOne(x => x.Product)
                .WithMany(x => x.Images)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureCms(ModelBuilder builder)
    {
        builder.Entity<ContentEntry>(b =>
        {
            b.ToTable("cms_content_entries");
            b.HasKey(x => x.Id);
            b.Property(x => x.NodeId).HasColumnName("node_id").HasMaxLength(255).IsRequired();
            b.Property(x => x.Type).HasColumnName("type").HasMaxLength(40).IsRequired();
            b.Property(x => x.Scope).HasColumnName("scope").HasMaxLength(10).IsRequired();
            b.Property(x => x.DraftValue).HasColumnName("draft_value").HasColumnType("nvarchar(max)");
            b.Property(x => x.PublishedValue).HasColumnName("published_value").HasColumnType("nvarchar(max)");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.Property(x => x.PublishedAt).HasColumnName("published_at");
            b.HasIndex(x => new { x.NodeId, x.Scope }).IsUnique();
        });

        builder.Entity<SiteSetting>(b =>
        {
            b.ToTable("cms_site_settings");
            b.HasKey(x => x.Id);
            b.Property(x => x.Key).HasColumnName("key").HasMaxLength(120).IsRequired();
            b.Property(x => x.Type).HasColumnName("type").HasMaxLength(40).IsRequired();
            b.Property(x => x.DraftValue).HasColumnName("draft_value").HasColumnType("nvarchar(max)");
            b.Property(x => x.PublishedValue).HasColumnName("published_value").HasColumnType("nvarchar(max)");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.Property(x => x.PublishedAt).HasColumnName("published_at");
            b.HasIndex(x => x.Key).IsUnique();
        });

        builder.Entity<MediaAsset>(b =>
        {
            b.ToTable("cms_media_assets");
            b.HasKey(x => x.Id);
            b.Property(x => x.FileName).HasColumnName("file_name").HasMaxLength(255).IsRequired();
            b.Property(x => x.OriginalFileName).HasColumnName("original_file_name").HasMaxLength(255).IsRequired();
            b.Property(x => x.Url).HasColumnName("url").HasMaxLength(500).IsRequired();
            b.Property(x => x.Folder).HasColumnName("folder").HasMaxLength(80).IsRequired();
            b.Property(x => x.ContentType).HasColumnName("content_type").HasMaxLength(120).IsRequired();
            b.Property(x => x.Size).HasColumnName("size");
            b.Property(x => x.Width).HasColumnName("width");
            b.Property(x => x.Height).HasColumnName("height");
            b.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.HasIndex(x => x.CreatedAt);
            b.HasIndex(x => x.Folder);
        });
    }

    private static void ConfigureContent(ModelBuilder builder)
    {
        builder.Entity<ArticleCategory>(b =>
        {
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.Slug).HasMaxLength(160).IsRequired();
        });

        builder.Entity<Article>(b =>
        {
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.Slug).HasMaxLength(160).IsRequired();
            b.Property(x => x.CoverImageUrl).HasMaxLength(500);
            b.HasOne(x => x.Category)
                .WithMany(x => x.Articles)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<StaticPage>(b =>
        {
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.Slug).HasMaxLength(80).IsRequired();
        });

        builder.Entity<Milestone>(b =>
        {
            b.HasIndex(x => x.Year);
        });
    }

    private static void ConfigureNetwork(ModelBuilder builder)
    {
        builder.Entity<Region>(b =>
        {
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.Slug).HasMaxLength(160).IsRequired();
            b.Property(x => x.ImageUrl).HasMaxLength(500);
        });

        builder.Entity<Stat>(b =>
        {
            b.HasIndex(x => x.Key).IsUnique();
            b.Property(x => x.Key).HasMaxLength(80).IsRequired();
            b.Property(x => x.Value).HasMaxLength(80).IsRequired();
            b.Property(x => x.Unit).HasMaxLength(40);
            b.Property(x => x.Icon).HasMaxLength(120);
        });
    }

    private static void ConfigureLeads(ModelBuilder builder)
    {
        builder.Entity<QuoteRequest>(b =>
        {
            b.Property(x => x.FullName).HasMaxLength(120).IsRequired();
            b.Property(x => x.Company).HasMaxLength(160).IsRequired();
            b.Property(x => x.Country).HasMaxLength(80).IsRequired();
            b.Property(x => x.Email).HasMaxLength(200).IsRequired();
            b.Property(x => x.Phone).HasMaxLength(40);
            b.Property(x => x.Quantity).HasMaxLength(80);
            b.Property(x => x.AttachmentUrl).HasMaxLength(500);
            b.Property(x => x.Locale).HasMaxLength(8);
            b.Property(x => x.IpAddress).HasMaxLength(64);
            b.Property(x => x.Message).HasMaxLength(4000);
            b.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.SetNull);
            b.HasIndex(x => x.CreatedAt);
            b.HasIndex(x => x.Status);
        });
    }

    private static void ConfigureNewsletter(ModelBuilder builder)
    {
        builder.Entity<NewsletterSubscriber>(b =>
        {
            b.HasIndex(x => x.Email).IsUnique();
            b.Property(x => x.Email).HasMaxLength(200).IsRequired();
            b.Property(x => x.Locale).HasMaxLength(8);
            b.Property(x => x.ConfirmToken).HasMaxLength(128);
            b.Property(x => x.IpAddress).HasMaxLength(64);
        });
    }

    private static void ConfigurePortfolio(ModelBuilder builder)
    {
        builder.Entity<AuthVerificationCode>(b =>
        {
            b.ToTable("admin_verification_codes");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("NEWID()");
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
            b.Property(x => x.CodeHash).HasColumnName("code_hash").HasMaxLength(128).IsRequired();
            b.Property(x => x.AttemptCount).HasColumnName("attempt_count");
            b.Property(x => x.RequestedIp).HasColumnName("requested_ip").HasMaxLength(64);
            b.Property(x => x.ExpiresAt).HasColumnName("expires_at").HasDefaultValueSql("DATEADD(minute, 10, SYSDATETIMEOFFSET())");
            b.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.Property(x => x.UsedAt).HasColumnName("used_at");
            b.HasIndex(x => new { x.Email, x.ExpiresAt });
            b.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ShowcaseProduct>(b =>
        {
            b.ToTable("showcase_products", tb =>
            {
                tb.HasCheckConstraint("CK_showcase_products_category", "[category] IN ('tropical', 'stone', 'citrus', 'exotic')");
                tb.HasCheckConstraint("CK_showcase_products_status", "[status] IN ('Draft', 'Live', 'Active', 'Seasonal', 'Review')");
                tb.HasCheckConstraint("CK_showcase_products_origin_json", "ISJSON([origin]) = 1");
                tb.HasCheckConstraint("CK_showcase_products_varieties_json", "ISJSON([varieties]) = 1");
            });
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("NEWID()");
            b.Property(x => x.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
            b.Property(x => x.NameAr).HasColumnName("name_ar").HasMaxLength(255);
            b.Property(x => x.Category).HasColumnName("category").HasMaxLength(40).IsRequired();
            b.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500).IsRequired();
            b.Property(x => x.ImageFilter).HasColumnName("image_filter").HasMaxLength(100);
            b.Property(x => x.OriginJson).HasColumnName("origin").HasColumnType("nvarchar(max)").IsRequired();
            b.Property(x => x.VarietiesJson).HasColumnName("varieties").HasColumnType("nvarchar(max)").IsRequired();
            b.Property(x => x.Description).HasColumnName("description").IsRequired();
            b.Property(x => x.DescriptionAr).HasColumnName("description_ar");
            b.Property(x => x.Note).HasColumnName("note");
            b.Property(x => x.Status).HasColumnName("status").HasMaxLength(40).IsRequired();
            b.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.HasIndex(x => x.Status);
        });

        builder.Entity<Origin>(b =>
        {
            b.ToTable("origins", tb =>
            {
                tb.HasCheckConstraint("CK_origins_status", "[status] IN ('Draft', 'Live', 'Active', 'Seasonal', 'Review')");
            });
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id").HasMaxLength(10);
            b.Property(x => x.Flag).HasColumnName("flag").HasMaxLength(10).IsRequired();
            b.Property(x => x.Country).HasColumnName("country").HasMaxLength(100).IsRequired();
            b.Property(x => x.CountryAr).HasColumnName("country_ar").HasMaxLength(100);
            b.Property(x => x.Focus).HasColumnName("focus");
            b.Property(x => x.FeaturedItems).HasColumnName("featured_items");
            b.Property(x => x.Latitude).HasColumnName("latitude");
            b.Property(x => x.Longitude).HasColumnName("longitude");
            b.Property(x => x.Status).HasColumnName("status").HasMaxLength(40).IsRequired();
            b.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
        });

        builder.Entity<PublicMessage>(b =>
        {
            b.ToTable("messages", tb =>
            {
                tb.HasCheckConstraint("CK_messages_status", "[status] IN ('New', 'Read')");
            });
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("NEWID()");
            b.Property(x => x.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
            b.Property(x => x.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
            b.Property(x => x.Subject).HasColumnName("subject").HasMaxLength(255).IsRequired();
            b.Property(x => x.Message).HasColumnName("message").IsRequired();
            b.Property(x => x.Summary).HasColumnName("summary");
            b.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
            b.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.HasIndex(x => x.Status);
        });

        builder.Entity<SiteContent>(b =>
        {
            b.ToTable("site_content", tb =>
            {
                tb.HasCheckConstraint("CK_site_content_single_row", "[id] = 1");
                tb.HasCheckConstraint("CK_site_content_configuration_json", "ISJSON([configuration]) = 1");
            });
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            b.Property(x => x.Configuration).HasColumnName("configuration").HasColumnType("nvarchar(max)").IsRequired();
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
        });

        builder.Entity<VisualOverride>(b =>
        {
            b.ToTable("visual_overrides", tb =>
            {
                tb.HasCheckConstraint("CK_visual_overrides_type", "[type] IN ('text', 'textarea', 'html', 'image')");
                tb.HasCheckConstraint("CK_visual_overrides_scope", "[scope] IN ('en', 'ar', 'global')");
            });
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("NEWID()");
            b.Property(x => x.NodeId).HasColumnName("node_id").HasMaxLength(255).IsRequired();
            b.Property(x => x.Type).HasColumnName("type").HasMaxLength(40).IsRequired();
            b.Property(x => x.Scope).HasColumnName("scope").HasMaxLength(10).IsRequired();
            b.Property(x => x.Value).HasColumnName("value").IsRequired();
            b.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("SYSDATETIMEOFFSET()");
            b.HasIndex(x => new { x.NodeId, x.Scope }).IsUnique();
            b.HasIndex(x => x.Scope);
        });
    }

}
