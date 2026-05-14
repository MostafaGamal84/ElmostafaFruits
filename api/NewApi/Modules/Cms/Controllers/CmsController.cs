using API.Modules.Cms.Dtos;
using API.Modules.Cms.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Cms.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Editor")]
[Route("api/v1/cms")]
public class CmsController : ControllerBase
{
    private readonly DataContext _db;

    public CmsController(DataContext db) => _db = db;

    [HttpGet("content")]
    public async Task<ActionResult<List<ContentEntryDto>>> GetContent(
        [FromQuery] string stage = "draft",
        CancellationToken ct = default)
    {
        var usePublished = string.Equals(stage, "published", StringComparison.OrdinalIgnoreCase);
        var entries = await _db.ContentEntries
            .AsNoTracking()
            .OrderBy(x => x.NodeId)
            .ThenBy(x => x.Scope)
            .ToListAsync(ct);

        return Ok(entries.Select(entry => ToDto(entry, usePublished)).ToList());
    }

    [HttpPost("content")]
    public async Task<ActionResult<ContentEntryDto>> UpsertContent(
        [FromBody] ContentEntryUpsertDto dto,
        CancellationToken ct = default)
    {
        var nodeId = dto.NodeId.Trim();
        var scope = string.IsNullOrWhiteSpace(dto.Scope) ? "global" : dto.Scope.Trim().ToLowerInvariant();
        var existing = await _db.ContentEntries
            .SingleOrDefaultAsync(x => x.NodeId == nodeId && x.Scope == scope, ct);

        if (existing is null)
        {
            existing = new ContentEntry
            {
                NodeId = nodeId,
                Scope = scope,
                Type = dto.Type.Trim().ToLowerInvariant()
            };
            _db.ContentEntries.Add(existing);
        }

        existing.Type = dto.Type.Trim().ToLowerInvariant();
        existing.DraftValue = dto.Value;
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(ToDto(existing, usePublished: false));
    }

    [HttpPost("content/publish")]
    public async Task<IActionResult> PublishContent(
        [FromBody] ContentPublishDto dto,
        CancellationToken ct = default)
    {
        var query = _db.ContentEntries.AsQueryable();

        if (!dto.PublishAll)
        {
            if (!string.IsNullOrWhiteSpace(dto.NodeId))
            {
                var nodeId = dto.NodeId.Trim();
                query = query.Where(x => x.NodeId == nodeId);
            }

            if (!string.IsNullOrWhiteSpace(dto.Scope))
            {
                var scope = dto.Scope.Trim().ToLowerInvariant();
                query = query.Where(x => x.Scope == scope);
            }
        }

        var entries = await query.ToListAsync(ct);
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in entries)
        {
            entry.PublishedValue = entry.DraftValue ?? string.Empty;
            entry.PublishedAt = now;
            entry.UpdatedAt = now;
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { published = entries.Count });
    }

    [HttpGet("settings")]
    public async Task<ActionResult<List<SiteSettingDto>>> GetSettings(
        [FromQuery] string stage = "draft",
        CancellationToken ct = default)
    {
        var usePublished = string.Equals(stage, "published", StringComparison.OrdinalIgnoreCase);
        var settings = await _db.SiteSettings
            .AsNoTracking()
            .OrderBy(x => x.Key)
            .ToListAsync(ct);

        return Ok(settings.Select(setting => ToDto(setting, usePublished)).ToList());
    }

    [AllowAnonymous]
    [HttpGet("settings/public")]
    public async Task<ActionResult<Dictionary<string, string>>> GetPublishedSettings(
        CancellationToken ct = default)
    {
        var settings = await _db.SiteSettings
            .AsNoTracking()
            .OrderBy(x => x.Key)
            .ToListAsync(ct);

        var result = CmsDefaults.DefaultSettings.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);
        foreach (var setting in settings)
        {
            result[setting.Key] = setting.PublishedValue ?? setting.DraftValue ?? string.Empty;
        }

        return Ok(result);
    }

    [HttpPost("settings")]
    public async Task<ActionResult<SiteSettingDto>> UpsertSetting(
        [FromBody] SiteSettingUpsertDto dto,
        CancellationToken ct = default)
    {
        var key = dto.Key.Trim();
        var existing = await _db.SiteSettings.SingleOrDefaultAsync(x => x.Key == key, ct);

        if (existing is null)
        {
            existing = new SiteSetting
            {
                Key = key,
                Type = dto.Type.Trim().ToLowerInvariant()
            };
            _db.SiteSettings.Add(existing);
        }

        existing.Type = dto.Type.Trim().ToLowerInvariant();
        existing.DraftValue = dto.Value;
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(ToDto(existing, usePublished: false));
    }

    [HttpPost("settings/publish")]
    public async Task<IActionResult> PublishSettings(
        [FromBody] SiteSettingPublishDto dto,
        CancellationToken ct = default)
    {
        var query = _db.SiteSettings.AsQueryable();
        if (!dto.PublishAll && !string.IsNullOrWhiteSpace(dto.Key))
        {
            var key = dto.Key.Trim();
            query = query.Where(x => x.Key == key);
        }

        var settings = await query.ToListAsync(ct);
        var now = DateTimeOffset.UtcNow;
        foreach (var setting in settings)
        {
            setting.PublishedValue = setting.DraftValue ?? string.Empty;
            setting.PublishedAt = now;
            setting.UpdatedAt = now;
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { published = settings.Count });
    }

    [HttpGet("media")]
    public async Task<ActionResult<List<MediaAssetDto>>> GetMedia(CancellationToken ct = default)
    {
        var assets = await _db.MediaAssets
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(500)
            .ToListAsync(ct);

        return Ok(assets.Select(ToDto).ToList());
    }

    private static ContentEntryDto ToDto(ContentEntry entry, bool usePublished) => new()
    {
        Id = entry.Id.ToString(),
        NodeId = entry.NodeId,
        Type = entry.Type,
        Scope = entry.Scope,
        Value = usePublished ? entry.PublishedValue ?? string.Empty : entry.DraftValue ?? entry.PublishedValue ?? string.Empty,
        Stage = usePublished ? "published" : "draft",
        UpdatedAt = entry.UpdatedAt,
        PublishedAt = entry.PublishedAt
    };

    private static SiteSettingDto ToDto(SiteSetting setting, bool usePublished) => new()
    {
        Id = setting.Id.ToString(),
        Key = setting.Key,
        Type = setting.Type,
        Value = usePublished ? setting.PublishedValue ?? string.Empty : setting.DraftValue ?? setting.PublishedValue ?? string.Empty,
        Stage = usePublished ? "published" : "draft",
        UpdatedAt = setting.UpdatedAt,
        PublishedAt = setting.PublishedAt
    };

    private static MediaAssetDto ToDto(MediaAsset asset) => new()
    {
        Id = asset.Id.ToString(),
        FileName = asset.FileName,
        OriginalFileName = asset.OriginalFileName,
        Url = asset.Url,
        Folder = asset.Folder,
        ContentType = asset.ContentType,
        Size = asset.Size,
        Width = asset.Width,
        Height = asset.Height,
        CreatedAt = asset.CreatedAt
    };
}
