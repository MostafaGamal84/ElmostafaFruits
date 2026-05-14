using System.Threading.RateLimiting;
using API.Common.Email;
using API.Extensions;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.OpenApi.Models;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, services, cfg) => cfg
        .ReadFrom.Configuration(ctx.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console());

    builder.Services.AddApplicationServices(builder.Configuration);
    builder.Services.AddIdentityServices(builder.Configuration);
    builder.Services.AddControllers();

    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssemblyContaining<Program>();

    builder.Services.AddAutoMapper(cfg => { }, typeof(Program).Assembly);

    var allowedCorsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("ClientCors", policy =>
        {
            if (allowedCorsOrigins.Length > 0)
            {
                policy
                    .WithOrigins(allowedCorsOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
            else
            {
                policy
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .SetIsOriginAllowed(_ => true);
            }
        });
    });

    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        options.AddFixedWindowLimiter("public-submit", opt =>
        {
            opt.PermitLimit = 5;
            opt.Window = TimeSpan.FromMinutes(1);
            opt.QueueLimit = 0;
        });

        options.AddFixedWindowLimiter("auth", opt =>
        {
            opt.PermitLimit = 10;
            opt.Window = TimeSpan.FromMinutes(1);
            opt.QueueLimit = 0;
        });

        options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
            RateLimitPartition.GetFixedWindowLimiter(
                ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 200,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                }));
    });

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "EL-MOSTAFA Portfolio API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "JWT token (without 'Bearer ' prefix)"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });
    });

    var app = builder.Build();

    var emailSender = app.Services.GetRequiredService<IEmailSender>();
    Log.Information(
        "Email sender in use: {Sender} (Environment: {Environment})",
        emailSender.GetType().Name,
        app.Environment.EnvironmentName);

    if (app.Environment.IsProduction() && emailSender is LoggingEmailSender)
    {
        throw new InvalidOperationException(
            "Refusing to start: LoggingEmailSender is active in Production. " +
            "This would silently DISCARD verification and notification emails while endpoints return success. " +
            "Fix: set Email:Smtp:Enabled=true and populate Email:Smtp:* in appsettings.Production.json " +
            "(or provide them via environment variables).");
    }

    app.UseSerilogRequestLogging();

    var swaggerEnabled = app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("Swagger:Enabled");

    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    if (swaggerEnabled)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EL-MOSTAFA Portfolio API v1"));
    }

    if (!app.Environment.IsDevelopment())
    {
        app.UseHsts();
    }

    app.Use(async (ctx, next) =>
    {
        ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
        // The admin live editor renders the public site inside a same-origin iframe.
        ctx.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
        ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        ctx.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
        await next();
    });

    if (!app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
    }
    app.UseDefaultFiles();
    app.UseStaticFiles();
    app.UseRouting();
    app.UseRateLimiter();
    app.UseCors("ClientCors");
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    var indexHtmlPath = Path.Combine(
        app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"),
        "index.html");

    app.MapFallback(async context =>
    {
        if (context.Request.Path.StartsWithSegments("/api") || !File.Exists(indexHtmlPath))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.SendFileAsync(indexHtmlPath);
    });

    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<DataContext>();
            var roleManager = services.GetRequiredService<RoleManager<AppRole>>();
            var userManager = services.GetRequiredService<UserManager<AppUser>>();

            await context.Database.MigrateAsync();
            await Seed.SeedRoles(roleManager);
            await Seed.SeedDefaultUsers(userManager);
            await Seed.EnsureUsersHaveRoles(userManager);
            await Seed.SeedPortfolioData(context);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "An error occurred during startup migration/seeding");
        }
    }

    await app.RunAsync();
}
catch (Exception ex)
    when (ex.GetType().Name == "HostAbortedException")
{
    throw;
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
