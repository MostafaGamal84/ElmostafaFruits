using API.Common.Web;
using API.Data;
using API.Modules.Content.Dtos;
using API.Modules.Content.Entities;
using API.Modules.Content.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.Content.Services;

public class StaticPageService : IStaticPageService
{
    private readonly DataContext _db;

    public StaticPageService(DataContext db) => _db = db;

    public async Task<List<StaticPageAdminDto>> ListAdminAsync(CancellationToken ct = default)
    {
        return await _db.StaticPages
            .AsNoTracking().Where(x => !x.IsDeleted)
            .OrderBy(x => x.Slug)
            .Select(x => new StaticPageAdminDto { Id = x.Id, Slug = x.Slug, Title = x.Title, Body = x.Body })
            .ToListAsync(ct);
    }

    public async Task<StaticPagePublicDto?> GetPublicBySlugAsync(string slug, string locale, CancellationToken ct = default)
    {
        var x = await _db.StaticPages.AsNoTracking().SingleOrDefaultAsync(p => p.Slug == slug && !p.IsDeleted, ct);
        return x is null ? null : new StaticPagePublicDto
        {
            Id = x.Id,
            Slug = x.Slug,
            Title = x.Title.Get(locale),
            Body = x.Body.Get(locale)
        };
    }

    public async Task<StaticPageAdminDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var x = await _db.StaticPages.AsNoTracking().SingleOrDefaultAsync(p => p.Id == id, ct);
        return x is null ? null : new StaticPageAdminDto { Id = x.Id, Slug = x.Slug, Title = x.Title, Body = x.Body };
    }

    public async Task<StaticPageAdminDto> UpsertAsync(StaticPageUpsertDto dto, CancellationToken ct = default)
    {
        var slug = SlugHelper.Slugify(dto.Slug);
        var entity = await _db.StaticPages.SingleOrDefaultAsync(x => x.Slug == slug, ct);
        if (entity is null)
        {
            entity = new StaticPage { Slug = slug, Title = dto.Title, Body = dto.Body };
            _db.StaticPages.Add(entity);
        }
        else
        {
            entity.Title = dto.Title;
            entity.Body = dto.Body;
            entity.IsDeleted = false;
            entity.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync(ct);
        return new StaticPageAdminDto { Id = entity.Id, Slug = entity.Slug, Title = entity.Title, Body = entity.Body };
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.StaticPages.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return false;
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
