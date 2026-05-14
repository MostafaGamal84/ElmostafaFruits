using System.Text.Json;
using System.Text.Json.Nodes;
using API.Modules.Cms;
using API.Modules.Cms.Entities;
using API.Modules.Portfolio.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Portfolio.Controllers;

[ApiController]
[Route("api/v1/content")]
public class SiteContentController : ControllerBase
{
    private readonly DataContext _db;

    public SiteContentController(DataContext db) => _db = db;

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var entries = await _db.ContentEntries
            .AsNoTracking()
            .Where(x => CmsDefaults.SiteContentNodeIds.Contains(x.NodeId))
            .ToListAsync(ct);

        if (entries.Count > 0)
        {
            var content = BuildSiteContent(entries);
            return Ok(content);
        }

        var legacyContent = await _db.SiteContents.AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1, ct);
        if (legacyContent is null) return Ok(CmsDefaults.GetDefaultSiteContent());

        return Ok(NormalizeConfiguration(PortfolioJson.ParseElement(legacyContent.Configuration)));
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] JsonElement configuration, CancellationToken ct)
    {
        if (configuration.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
        {
            return BadRequest(new { message = "Content configuration is required" });
        }

        var normalizedConfiguration = NormalizeConfiguration(configuration);

        var content = await _db.SiteContents.SingleOrDefaultAsync(x => x.Id == 1, ct);
        if (content is null)
        {
            content = new SiteContent { Id = 1 };
            _db.SiteContents.Add(content);
        }

        content.Configuration = PortfolioJson.SerializeElement(normalizedConfiguration);
        content.UpdatedAt = DateTimeOffset.UtcNow;

        SyncSiteContentEntries(normalizedConfiguration);
        await _db.SaveChangesAsync(ct);

        return Ok(normalizedConfiguration);
    }

    private JsonElement BuildSiteContent(List<ContentEntry> entries)
    {
        var root = JsonNode.Parse(CmsDefaults.GetDefaultSiteContent().GetRawText())!.AsObject();

        foreach (var entry in entries
                     .OrderBy(x => x.NodeId)
                     .ThenBy(x => string.Equals(x.Scope, "global", StringComparison.OrdinalIgnoreCase) ? 0 : 1))
        {
            var value = entry.PublishedValue ?? entry.DraftValue;
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            ApplySiteContentValue(root, entry.NodeId, entry.Scope, value);
        }

        return JsonSerializer.SerializeToElement(root);
    }

    private static void ApplySiteContentValue(JsonObject root, string nodeId, string scope, string value)
    {
        switch (nodeId)
        {
            case "navbar.about":
                root["navbar"]!["about"]![scope] = value;
                break;
            case "navbar.products":
                root["navbar"]!["products"]![scope] = value;
                break;
            case "navbar.origins":
                root["navbar"]!["origins"]![scope] = value;
                break;
            case "navbar.catalog":
                root["navbar"]!["catalog"]![scope] = value;
                break;
            case "navbar.blog":
                root["navbar"]!["blog"]![scope] = value;
                break;
            case "navbar.quote":
                root["navbar"]!["quote"]![scope] = value;
                break;
            case "navbar.contact":
                root["navbar"]!["contact"]![scope] = value;
                break;
            case "navbar.adminLink":
                root["navbar"]!["adminLink"]![scope] = value;
                break;
            case "hero.eyebrow":
                root["hero"]!["eyebrow"]![scope] = value;
                break;
            case "hero.title":
                root["hero"]!["title"]![scope] = value;
                break;
            case "hero.subtitle":
                root["hero"]!["subtitle"]![scope] = value;
                break;
            case "hero.cta":
                root["hero"]!["cta"]![scope] = value;
                break;
            case "footer.brandText":
                if (string.Equals(scope, "ar", StringComparison.OrdinalIgnoreCase))
                {
                    root["footer"]!["brandText"]!["ar"] = value;
                    break;
                }

                if (string.Equals(scope, "en", StringComparison.OrdinalIgnoreCase))
                {
                    root["footer"]!["brandText"]!["en"] = value;
                    break;
                }

                if (ContainsArabic(value))
                {
                    root["footer"]!["brandText"]!["ar"] = value;
                    break;
                }

                root["footer"]!["brandText"]!["en"] = value;
                break;
            case "footer.description":
                root["footer"]!["description"]![scope] = value;
                break;
            case "footer.address":
                root["footer"]!["address"]![scope] = value;
                break;
            case "footer.email":
                root["footer"]!["email"] = value;
                break;
            case "footer.phone":
                root["footer"]!["phone"] = value;
                break;
        }
    }

    private void SyncSiteContentEntries(JsonElement configuration)
    {
        UpsertSiteContentEntry("navbar.about", "en", configuration.GetProperty("navbar").GetProperty("about").GetProperty("en").GetString());
        UpsertSiteContentEntry("navbar.about", "ar", configuration.GetProperty("navbar").GetProperty("about").GetProperty("ar").GetString());
        UpsertSiteContentEntry("navbar.products", "en", configuration.GetProperty("navbar").GetProperty("products").GetProperty("en").GetString());
        UpsertSiteContentEntry("navbar.products", "ar", configuration.GetProperty("navbar").GetProperty("products").GetProperty("ar").GetString());
        UpsertSiteContentEntry("navbar.origins", "en", configuration.GetProperty("navbar").GetProperty("origins").GetProperty("en").GetString());
        UpsertSiteContentEntry("navbar.origins", "ar", configuration.GetProperty("navbar").GetProperty("origins").GetProperty("ar").GetString());
        UpsertSiteContentEntry("navbar.catalog", "en", configuration.GetProperty("navbar").GetProperty("catalog").GetProperty("en").GetString());
        UpsertSiteContentEntry("navbar.catalog", "ar", configuration.GetProperty("navbar").GetProperty("catalog").GetProperty("ar").GetString());
        UpsertSiteContentEntry("navbar.blog", "en", configuration.GetProperty("navbar").GetProperty("blog").GetProperty("en").GetString());
        UpsertSiteContentEntry("navbar.blog", "ar", configuration.GetProperty("navbar").GetProperty("blog").GetProperty("ar").GetString());
        UpsertSiteContentEntry("navbar.quote", "en", configuration.GetProperty("navbar").GetProperty("quote").GetProperty("en").GetString());
        UpsertSiteContentEntry("navbar.quote", "ar", configuration.GetProperty("navbar").GetProperty("quote").GetProperty("ar").GetString());
        UpsertSiteContentEntry("navbar.contact", "en", configuration.GetProperty("navbar").GetProperty("contact").GetProperty("en").GetString());
        UpsertSiteContentEntry("navbar.contact", "ar", configuration.GetProperty("navbar").GetProperty("contact").GetProperty("ar").GetString());
        UpsertSiteContentEntry("navbar.adminLink", "en", configuration.GetProperty("navbar").GetProperty("adminLink").GetProperty("en").GetString());
        UpsertSiteContentEntry("navbar.adminLink", "ar", configuration.GetProperty("navbar").GetProperty("adminLink").GetProperty("ar").GetString());

        UpsertSiteContentEntry("hero.eyebrow", "en", configuration.GetProperty("hero").GetProperty("eyebrow").GetProperty("en").GetString());
        UpsertSiteContentEntry("hero.eyebrow", "ar", configuration.GetProperty("hero").GetProperty("eyebrow").GetProperty("ar").GetString());
        UpsertSiteContentEntry("hero.title", "en", configuration.GetProperty("hero").GetProperty("title").GetProperty("en").GetString());
        UpsertSiteContentEntry("hero.title", "ar", configuration.GetProperty("hero").GetProperty("title").GetProperty("ar").GetString());
        UpsertSiteContentEntry("hero.subtitle", "en", configuration.GetProperty("hero").GetProperty("subtitle").GetProperty("en").GetString());
        UpsertSiteContentEntry("hero.subtitle", "ar", configuration.GetProperty("hero").GetProperty("subtitle").GetProperty("ar").GetString());
        UpsertSiteContentEntry("hero.cta", "en", configuration.GetProperty("hero").GetProperty("cta").GetProperty("en").GetString());
        UpsertSiteContentEntry("hero.cta", "ar", configuration.GetProperty("hero").GetProperty("cta").GetProperty("ar").GetString());

        UpsertSiteContentEntry("footer.brandText", "en", configuration.GetProperty("footer").GetProperty("brandText").GetProperty("en").GetString());
        UpsertSiteContentEntry("footer.brandText", "ar", configuration.GetProperty("footer").GetProperty("brandText").GetProperty("ar").GetString());
        RemoveSiteContentEntry("footer.brandText", "global");
        UpsertSiteContentEntry("footer.description", "en", configuration.GetProperty("footer").GetProperty("description").GetProperty("en").GetString());
        UpsertSiteContentEntry("footer.description", "ar", configuration.GetProperty("footer").GetProperty("description").GetProperty("ar").GetString());
        UpsertSiteContentEntry("footer.address", "en", configuration.GetProperty("footer").GetProperty("address").GetProperty("en").GetString());
        UpsertSiteContentEntry("footer.address", "ar", configuration.GetProperty("footer").GetProperty("address").GetProperty("ar").GetString());
        UpsertSiteContentEntry("footer.email", "global", configuration.GetProperty("footer").GetProperty("email").GetString());
        UpsertSiteContentEntry("footer.phone", "global", configuration.GetProperty("footer").GetProperty("phone").GetString());
    }

    private void UpsertSiteContentEntry(string nodeId, string scope, string? value)
    {
        var existing = _db.ContentEntries.Local.FirstOrDefault(x => x.NodeId == nodeId && x.Scope == scope)
            ?? _db.ContentEntries.FirstOrDefault(x => x.NodeId == nodeId && x.Scope == scope);

        if (existing is null)
        {
            existing = new ContentEntry
            {
                NodeId = nodeId,
                Scope = scope,
                Type = nodeId is "footer.brandText" or "footer.email" or "footer.phone" ? "text" : "text"
            };
            _db.ContentEntries.Add(existing);
        }

        existing.DraftValue = value ?? string.Empty;
        existing.PublishedValue = value ?? string.Empty;
        existing.UpdatedAt = DateTimeOffset.UtcNow;
        existing.PublishedAt = DateTimeOffset.UtcNow;
    }

    private void RemoveSiteContentEntry(string nodeId, string scope)
    {
        var existing = _db.ContentEntries.Local.FirstOrDefault(x => x.NodeId == nodeId && x.Scope == scope)
            ?? _db.ContentEntries.FirstOrDefault(x => x.NodeId == nodeId && x.Scope == scope);

        if (existing is not null)
        {
            _db.ContentEntries.Remove(existing);
        }
    }

    private static JsonElement NormalizeConfiguration(JsonElement configuration)
    {
        var root = JsonNode.Parse(configuration.GetRawText())?.AsObject() ?? new JsonObject();
        if (root["footer"] is not JsonObject footer)
        {
            return JsonSerializer.SerializeToElement(root);
        }

        footer["brandText"] = NormalizeFooterBrandText(footer["brandText"]);
        return JsonSerializer.SerializeToElement(root);
    }

    private static JsonNode NormalizeFooterBrandText(JsonNode? brandTextNode)
    {
        if (brandTextNode is JsonObject localized)
        {
            localized["en"] = ReadLocalizedNodeValue(localized["en"], "EL MOSTAFA");
            localized["ar"] = ReadLocalizedNodeValue(localized["ar"], "\u0627\u0644\u0645\u0635\u0637\u0641\u0649");
            return localized;
        }

        var legacyValue = brandTextNode?.GetValue<string>() ?? string.Empty;
        return BuildLocalizedFooterBrandText(legacyValue);
    }

    private static JsonObject BuildLocalizedFooterBrandText(string? legacyValue)
    {
        var normalized = string.IsNullOrWhiteSpace(legacyValue) ? string.Empty : legacyValue.Trim();
        if (string.IsNullOrEmpty(normalized))
        {
            return new JsonObject
            {
                ["en"] = "EL MOSTAFA",
                ["ar"] = "\u0627\u0644\u0645\u0635\u0637\u0641\u0649"
            };
        }

        return ContainsArabic(normalized)
            ? new JsonObject
            {
                ["en"] = "EL MOSTAFA",
                ["ar"] = normalized
            }
            : new JsonObject
            {
                ["en"] = normalized,
                ["ar"] = "\u0627\u0644\u0645\u0635\u0637\u0641\u0649"
            };
    }

    private static string ReadLocalizedNodeValue(JsonNode? node, string fallback)
    {
        var value = node?.GetValue<string>();
        return string.IsNullOrWhiteSpace(value) ? fallback : value;
    }

    private static bool ContainsArabic(string value)
    {
        return value.Any(ch => ch is >= '\u0600' and <= '\u06FF');
    }
}
