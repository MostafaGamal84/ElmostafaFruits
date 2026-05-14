using API.Modules.Portfolio.Dtos;
using API.Modules.Cms;
using API.Modules.Cms.Entities;
using API.Modules.Portfolio.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Portfolio.Controllers;

[ApiController]
[Route("api/v1/overrides")]
public class VisualOverridesController : ControllerBase
{
    private readonly DataContext _db;

    public VisualOverridesController(DataContext db) => _db = db;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<VisualOverrideDto>>> GetAll(CancellationToken ct)
    {
        var entries = await _db.ContentEntries
            .AsNoTracking()
            .Where(x => !CmsDefaults.SiteContentNodeIds.Contains(x.NodeId))
            .Where(x => x.PublishedValue != null)
            .OrderBy(x => x.NodeId)
            .ThenBy(x => x.Scope)
            .ToListAsync(ct);

        if (entries.Count > 0)
        {
            return Ok(entries.Select(ToDto).ToList());
        }

        var legacyOverrides = await _db.VisualOverrides
            .AsNoTracking()
            .OrderBy(x => x.NodeId)
            .ThenBy(x => x.Scope)
            .ToListAsync(ct);

        return Ok(legacyOverrides.Select(ToDto).ToList());
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<VisualOverrideDto>> Upsert([FromBody] VisualOverrideUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        if (!PortfolioConstants.IsValidOverrideType(dto.Type))
        {
            return BadRequest(new { message = "Invalid override type" });
        }

        if (!PortfolioConstants.IsValidOverrideScope(dto.Scope))
        {
            return BadRequest(new { message = "Invalid override scope" });
        }

        var nodeId = dto.NodeId.Trim();
        var scope = PortfolioConstants.NormalizeOverrideScope(dto.Scope);
        var existing = await _db.ContentEntries
            .SingleOrDefaultAsync(x => x.NodeId == nodeId && x.Scope == scope, ct);

        if (existing is null)
        {
            existing = new ContentEntry
            {
                NodeId = nodeId,
                Scope = scope,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            _db.ContentEntries.Add(existing);
        }

        existing.Type = PortfolioConstants.NormalizeOverrideType(dto.Type);
        existing.DraftValue = dto.Value;
        existing.PublishedValue = dto.Value;
        existing.UpdatedAt = DateTimeOffset.UtcNow;
        existing.PublishedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(ToDto(existing));
    }

    private static VisualOverrideDto ToDto(VisualOverride visualOverride) => new()
    {
        Id = visualOverride.Id.ToString(),
        NodeId = visualOverride.NodeId,
        Type = visualOverride.Type,
        Scope = visualOverride.Scope,
        Value = visualOverride.Value
    };

    private static VisualOverrideDto ToDto(ContentEntry entry) => new()
    {
        Id = entry.Id.ToString(),
        NodeId = entry.NodeId,
        Type = entry.Type,
        Scope = entry.Scope,
        Value = entry.PublishedValue ?? entry.DraftValue ?? string.Empty
    };
}
