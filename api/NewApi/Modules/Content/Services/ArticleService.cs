using API.Common.Web;
using API.Data;
using API.Modules.Catalog.Interfaces;
using API.Modules.Content.Dtos;
using API.Modules.Content.Entities;
using API.Modules.Content.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.Content.Services;

public class ArticleService : IArticleService
{
    private readonly DataContext _db;

    public ArticleService(DataContext db) => _db = db;

    public async Task<PagedResult<ArticlePublicListItemDto>> ListPublicAsync(ArticleFilter filter, string locale, CancellationToken ct = default)
    {
        var query = _db.Articles
            .AsNoTracking()
            .Include(x => x.Category)
            .Where(x => !x.IsDeleted && x.IsPublished && x.PublishedAt != null && x.PublishedAt <= DateTime.UtcNow);

        if (!string.IsNullOrWhiteSpace(filter.CategorySlug))
            query = query.Where(x => x.Category != null && x.Category.Slug == filter.CategorySlug);

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 50);

        var items = (await query
            .OrderByDescending(x => x.PublishedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(ct))
            .Select(x => MapPublicListItem(x, locale))
            .ToList();

        return new PagedResult<ArticlePublicListItemDto> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<ArticlePublicDetailDto?> GetPublicBySlugAsync(string slug, string locale, CancellationToken ct = default)
    {
        var x = await _db.Articles
            .AsNoTracking()
            .Include(a => a.Category)
            .SingleOrDefaultAsync(a => a.Slug == slug && !a.IsDeleted && a.IsPublished && a.PublishedAt != null && a.PublishedAt <= DateTime.UtcNow, ct);
        if (x is null) return null;
        return new ArticlePublicDetailDto
        {
            Id = x.Id,
            Slug = x.Slug,
            Title = x.Title.Get(locale),
            Excerpt = x.Excerpt.Get(locale),
            CoverImageUrl = x.CoverImageUrl,
            CategorySlug = x.Category?.Slug,
            CategoryName = x.Category?.Name.Get(locale),
            PublishedAt = x.PublishedAt,
            Body = x.Body.Get(locale)
        };
    }

    public async Task<PagedResult<ArticleAdminDto>> ListAdminAsync(ArticleFilter filter, CancellationToken ct = default)
    {
        var query = _db.Articles
            .AsNoTracking()
            .Include(x => x.Category)
            .Where(x => !x.IsDeleted);

        if (filter.IsPublished.HasValue)
            query = query.Where(x => x.IsPublished == filter.IsPublished);
        if (!string.IsNullOrWhiteSpace(filter.CategorySlug))
            query = query.Where(x => x.Category != null && x.Category.Slug == filter.CategorySlug);

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var items = (await query
            .OrderByDescending(x => x.PublishedAt ?? x.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(ct))
            .Select(MapAdmin)
            .ToList();

        return new PagedResult<ArticleAdminDto> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<ArticleAdminDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var x = await _db.Articles.AsNoTracking().Include(a => a.Category).SingleOrDefaultAsync(a => a.Id == id, ct);
        return x is null ? null : MapAdmin(x);
    }

    public async Task<ArticleAdminDto> CreateAsync(ArticleUpsertDto dto, CancellationToken ct = default)
    {
        var slug = await UniqueSlug(dto.Slug, dto.Title.Get("en"), null, ct);
        var entity = new Article
        {
            Slug = slug,
            Title = dto.Title,
            Excerpt = dto.Excerpt,
            Body = dto.Body,
            CoverImageUrl = dto.CoverImageUrl,
            CategoryId = dto.CategoryId,
            PublishedAt = dto.PublishedAt,
            IsPublished = dto.IsPublished
        };
        _db.Articles.Add(entity);
        await _db.SaveChangesAsync(ct);
        return (await GetByIdAsync(entity.Id, ct))!;
    }

    public async Task<ArticleAdminDto?> UpdateAsync(int id, ArticleUpsertDto dto, CancellationToken ct = default)
    {
        var entity = await _db.Articles.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return null;
        entity.Slug = await UniqueSlug(dto.Slug ?? entity.Slug, dto.Title.Get("en"), id, ct);
        entity.Title = dto.Title;
        entity.Excerpt = dto.Excerpt;
        entity.Body = dto.Body;
        entity.CoverImageUrl = dto.CoverImageUrl;
        entity.CategoryId = dto.CategoryId;
        entity.PublishedAt = dto.PublishedAt;
        entity.IsPublished = dto.IsPublished;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Articles.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return false;
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static ArticlePublicListItemDto MapPublicListItem(Article x, string locale) => new()
    {
        Id = x.Id,
        Slug = x.Slug,
        Title = x.Title.Get(locale),
        Excerpt = x.Excerpt.Get(locale),
        CoverImageUrl = x.CoverImageUrl,
        CategorySlug = x.Category?.Slug,
        CategoryName = x.Category?.Name.Get(locale),
        PublishedAt = x.PublishedAt
    };

    private static ArticleAdminDto MapAdmin(Article x) => new()
    {
        Id = x.Id,
        Slug = x.Slug,
        Title = x.Title,
        Excerpt = x.Excerpt,
        Body = x.Body,
        CoverImageUrl = x.CoverImageUrl,
        CategoryId = x.CategoryId,
        CategorySlug = x.Category?.Slug,
        PublishedAt = x.PublishedAt,
        IsPublished = x.IsPublished
    };

    private async Task<string> UniqueSlug(string? requested, string fallback, int? excludeId, CancellationToken ct)
    {
        var baseSlug = SlugHelper.Slugify(!string.IsNullOrWhiteSpace(requested) ? requested : fallback);
        if (string.IsNullOrWhiteSpace(baseSlug)) baseSlug = $"article-{DateTime.UtcNow.Ticks}";
        var slug = baseSlug;
        var i = 1;
        while (await _db.Articles.AnyAsync(x => x.Slug == slug && (excludeId == null || x.Id != excludeId), ct))
        {
            slug = $"{baseSlug}-{++i}";
        }
        return slug;
    }
}
