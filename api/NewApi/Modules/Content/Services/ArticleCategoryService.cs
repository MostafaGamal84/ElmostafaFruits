using API.Common.Web;
using API.Data;
using API.Modules.Content.Dtos;
using API.Modules.Content.Entities;
using API.Modules.Content.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.Content.Services;

public class ArticleCategoryService : IArticleCategoryService
{
    private readonly DataContext _db;

    public ArticleCategoryService(DataContext db) => _db = db;

    public async Task<List<ArticleCategoryAdminDto>> ListAdminAsync(CancellationToken ct = default)
    {
        return await _db.ArticleCategories
            .AsNoTracking()
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.Id)
            .Select(x => new ArticleCategoryAdminDto { Id = x.Id, Slug = x.Slug, Name = x.Name })
            .ToListAsync(ct);
    }

    public async Task<List<ArticleCategoryPublicDto>> ListPublicAsync(string locale, CancellationToken ct = default)
    {
        var entities = await _db.ArticleCategories
            .AsNoTracking()
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.Id)
            .ToListAsync(ct);
        return entities.Select(x => new ArticleCategoryPublicDto { Id = x.Id, Slug = x.Slug, Name = x.Name.Get(locale) }).ToList();
    }

    public async Task<ArticleCategoryAdminDto> CreateAsync(ArticleCategoryUpsertDto dto, CancellationToken ct = default)
    {
        var slug = await UniqueSlug(dto.Slug, dto.Name.Get("en"), null, ct);
        var entity = new ArticleCategory { Slug = slug, Name = dto.Name };
        _db.ArticleCategories.Add(entity);
        await _db.SaveChangesAsync(ct);
        return new ArticleCategoryAdminDto { Id = entity.Id, Slug = entity.Slug, Name = entity.Name };
    }

    public async Task<ArticleCategoryAdminDto?> UpdateAsync(int id, ArticleCategoryUpsertDto dto, CancellationToken ct = default)
    {
        var entity = await _db.ArticleCategories.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return null;
        entity.Slug = await UniqueSlug(dto.Slug ?? entity.Slug, dto.Name.Get("en"), id, ct);
        entity.Name = dto.Name;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new ArticleCategoryAdminDto { Id = entity.Id, Slug = entity.Slug, Name = entity.Name };
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.ArticleCategories.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return false;
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private async Task<string> UniqueSlug(string? requested, string fallback, int? excludeId, CancellationToken ct)
    {
        var baseSlug = SlugHelper.Slugify(!string.IsNullOrWhiteSpace(requested) ? requested : fallback);
        if (string.IsNullOrWhiteSpace(baseSlug)) baseSlug = $"cat-{DateTime.UtcNow.Ticks}";
        var slug = baseSlug;
        var i = 1;
        while (await _db.ArticleCategories.AnyAsync(x => x.Slug == slug && (excludeId == null || x.Id != excludeId), ct))
        {
            slug = $"{baseSlug}-{++i}";
        }
        return slug;
    }
}
