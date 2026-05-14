using API.Common.Email;
using API.Common.Recaptcha;
using API.Data;
using API.Interfaces;
using API.Modules.Catalog.Interfaces;
using API.Modules.Catalog.Services;
using API.Modules.Content.Interfaces;
using API.Modules.Content.Services;
using API.Modules.Leads.Interfaces;
using API.Modules.Leads.Services;
using API.Modules.Network.Interfaces;
using API.Modules.Network.Services;
using API.Modules.Newsletter.Interfaces;
using API.Modules.Newsletter.Services;
using API.Modules.Uploads.Services;
using API.Services;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<ITokenService, TokenService>();

        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();

        services.AddScoped<IArticleCategoryService, ArticleCategoryService>();
        services.AddScoped<IArticleService, ArticleService>();
        services.AddScoped<IStaticPageService, StaticPageService>();
        services.AddScoped<IMilestoneService, MilestoneService>();

        services.AddScoped<IRegionService, RegionService>();
        services.AddScoped<IStatService, StatService>();

        services.AddScoped<IQuoteRequestService, QuoteRequestService>();
        services.AddScoped<INewsletterService, NewsletterService>();

        services.AddScoped<IImageUploadService, ImageUploadService>();

        services.Configure<SmtpEmailOptions>(config.GetSection(SmtpEmailOptions.SectionName));
        if (config.GetValue<bool>("Email:Smtp:Enabled"))
        {
            services.AddTransient<IEmailSender, SmtpEmailSender>();
        }
        else
        {
            services.AddSingleton<IEmailSender, LoggingEmailSender>();
        }

        services.Configure<RecaptchaOptions>(config.GetSection("Recaptcha"));
        var recaptchaEnabled = config.GetValue<bool>("Recaptcha:Enabled");
        if (recaptchaEnabled)
        {
            services.AddHttpClient<IRecaptchaVerifier, GoogleRecaptchaVerifier>();
        }
        else
        {
            services.AddSingleton<IRecaptchaVerifier, NullRecaptchaVerifier>();
        }

        services.AddDbContext<DataContext>(options =>
        {
            options.UseSqlServer(config.GetConnectionString("DefaultConnection"));
        });

        return services;
    }
}
