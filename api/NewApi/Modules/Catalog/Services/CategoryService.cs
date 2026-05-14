using API.Common.Web;
using API.Data;
using API.Modules.Catalog.Dtos;
using API.Modules.Catalog.Entities;
using API.Modules.Catalog.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.Catalog.Services;

public class CategoryService : ICategoryService
{
    private readonly DataContext _db;

    public CategoryService(DataContext db) => _db = db;

    public async Task<List<CategoryAdminDto>> ListAdminAsync(CancellationToken ct = default)
    {
        return await _db.Categories
            .AsNoTracking()
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .Select(x => new CategoryAdminDto
            {
                Id = x.Id,
                Slug = x.Slug,
                Name = x.Name,
                Description = x.Description,
                Icon = x.Icon,
                SortOrder = x.SortOrder,
                IsActive = x.IsActive,
                ProductCount = x.Products.Count(p => !p.IsDeleted)
            })
            .ToListAsync(ct);
    }

    public async Task<List<CategoryPublicDto>> ListPublicAsync(string locale, CancellationToken ct = default)
    {
        var entities = await _db.Categories
            .AsNoTracking()
            .Where(x => x.IsActive && !x.IsDeleted)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .Include(x => x.Products)
            .ToListAsync(ct);

        return entities.Select(x => new CategoryPublicDto
        {
            Id = x.Id,
            Slug = x.Slug,
            Name = x.Name.Get(locale),
            Description = x.Description.Get(locale),
            Icon = x.Icon,
            SortOrder = x.SortOrder,
            ProductCount = x.Products.Count(p => !p.IsDeleted && p.IsActive)
        }).ToList();
    }

    public async Task<CategoryAdminDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var x = await _db.Categories
            .AsNoTracking()
            .Include(c => c.Products)
            .SingleOrDefaultAsync(c => c.Id == id, ct);
        if (x is null) return null;
        return new CategoryAdminDto
        {
            Id = x.Id,
            Slug = x.Slug,
            Name = x.Name,
            Description = x.Description,
            Icon = x.Icon,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            ProductCount = x.Products.Count(p => !p.IsDeleted)
        };
    }

    public async Task<CategoryPublicDto?> GetPublicBySlugAsync(string slug, string locale, CancellationToken ct = default)
    {
        var x = await _db.Categories
            .AsNoTracking()
            .Include(c => c.Products)
            .SingleOrDefaultAsync(c => c.Slug == slug && c.IsActive && !c.IsDeleted, ct);
        if (x is null) return null;
        return new CategoryPublicDto
        {
            Id = x.Id,
            Slug = x.Slug,
            Name = x.Name.Get(locale),
            Description = x.Description.Get(locale),
            Icon = x.Icon,
            SortOrder = x.SortOrder,
            ProductCount = x.Products.Count(p => !p.IsDeleted && p.IsActive)
        };
    }

    public async Task<CategoryAdminDto> CreateAsync(CategoryUpsertDto dto, CancellationToken ct = default)
    {
        var slug = await BuildUniqueSlugAsync(dto.Slug, dto.Name.Get("en"), null, ct);
        var entity = new Category
        {
            Slug = slug,
            Name = dto.Name,
            Description = dto.Description,
            Icon = dto.Icon,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive
        };
        _db.Categories.Add(entity);
        await _db.SaveChangesAsync(ct);
        return (await GetByIdAsync(entity.Id, ct))!;
    }

    public async Task<CategoryAdminDto?> UpdateAsync(int id, CategoryUpsertDto dto, CancellationToken ct = default)
    {
        var entity = await _db.Categories.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return null;

        entity.Slug = await BuildUniqueSlugAsync(dto.Slug ?? entity.Slug, dto.Name.Get("en"), id, ct);
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.Icon = dto.Icon;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Categories.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return false;
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private async Task<string> BuildUniqueSlugAsync(string? requested, string fallbackSource, int? excludeId, CancellationToken ct)
    {
        var baseSlug = !string.IsNullOrWhiteSpace(requested)
            ? SlugHelper.Slugify(requested)
            : SlugHelper.Slugify(fallbackSource);
        if (string.IsNullOrWhiteSpace(baseSlug)) baseSlug = $"category-{DateTime.UtcNow.Ticks}";

        var slug = baseSlug;
        var i = 1;
        while (await _db.Categories.AnyAsync(c => c.Slug == slug && (excludeId == null || c.Id != excludeId), ct))
        {
            slug = $"{baseSlug}-{++i}";
        }
        return slug;
    }
}
