using API.Common.Web;
using API.Data;
using API.Modules.Catalog.Dtos;
using API.Modules.Catalog.Entities;
using API.Modules.Catalog.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.Catalog.Services;

public class ProductService : IProductService
{
    private readonly DataContext _db;

    public ProductService(DataContext db) => _db = db;

    public async Task<PagedResult<ProductPublicListItemDto>> ListPublicAsync(ProductFilter filter, string locale, CancellationToken ct = default)
    {
        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive && !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(filter.CategorySlug))
        {
            query = query.Where(p => p.Category!.Slug == filter.CategorySlug);
        }
        if (filter.IsFeatured == true)
        {
            query = query.Where(p => p.IsFeatured);
        }

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var entities = await query
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = entities.Select(p => MapPublicListItem(p, locale)).ToList();
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim();
            items = items.Where(x =>
                x.Name.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                x.ShortDescription.Contains(s, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return new PagedResult<ProductPublicListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductPublicDetailDto?> GetPublicBySlugAsync(string slug, string locale, CancellationToken ct = default)
    {
        var p = await _db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Images)
            .SingleOrDefaultAsync(x => x.Slug == slug && x.IsActive && !x.IsDeleted, ct);
        if (p is null) return null;
        return new ProductPublicDetailDto
        {
            Id = p.Id,
            Slug = p.Slug,
            Name = p.Name.Get(locale),
            ShortDescription = p.ShortDescription.Get(locale),
            CategorySlug = p.Category?.Slug ?? string.Empty,
            CategoryName = p.Category?.Name.Get(locale) ?? string.Empty,
            CoverImageUrl = p.Images.OrderByDescending(i => i.IsCover).ThenBy(i => i.SortOrder).FirstOrDefault()?.Url,
            IsFeatured = p.IsFeatured,
            LongDescription = p.LongDescription.Get(locale),
            Origin = p.Origin.Get(locale),
            Season = p.Season.Get(locale),
            Calibers = p.Calibers.Get(locale),
            PackagingDetails = p.PackagingDetails.Get(locale),
            Images = p.Images
                .OrderByDescending(i => i.IsCover).ThenBy(i => i.SortOrder)
                .Select(i => new ProductImagePublicDto
                {
                    Id = i.Id,
                    Url = i.Url,
                    Alt = i.Alt.Get(locale),
                    SortOrder = i.SortOrder,
                    IsCover = i.IsCover
                }).ToList()
        };
    }

    public async Task<PagedResult<ProductAdminDto>> ListAdminAsync(ProductFilter filter, CancellationToken ct = default)
    {
        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(filter.CategorySlug))
        {
            query = query.Where(p => p.Category!.Slug == filter.CategorySlug);
        }

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var items = (await query
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct))
            .Select(MapAdmin).ToList();

        return new PagedResult<ProductAdminDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductAdminDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var p = await _db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Images)
            .SingleOrDefaultAsync(x => x.Id == id, ct);
        return p is null ? null : MapAdmin(p);
    }

    public async Task<ProductAdminDto> CreateAsync(ProductUpsertDto dto, CancellationToken ct = default)
    {
        var slug = await BuildUniqueSlugAsync(dto.Slug, dto.Name.Get("en"), null, ct);
        var entity = new Product
        {
            CategoryId = dto.CategoryId,
            Slug = slug,
            Name = dto.Name,
            ShortDescription = dto.ShortDescription,
            LongDescription = dto.LongDescription,
            Origin = dto.Origin,
            Season = dto.Season,
            Calibers = dto.Calibers,
            PackagingDetails = dto.PackagingDetails,
            IsFeatured = dto.IsFeatured,
            IsActive = dto.IsActive,
            SortOrder = dto.SortOrder
        };
        _db.Products.Add(entity);
        await _db.SaveChangesAsync(ct);
        return (await GetByIdAsync(entity.Id, ct))!;
    }

    public async Task<ProductAdminDto?> UpdateAsync(int id, ProductUpsertDto dto, CancellationToken ct = default)
    {
        var entity = await _db.Products.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return null;

        entity.CategoryId = dto.CategoryId;
        entity.Slug = await BuildUniqueSlugAsync(dto.Slug ?? entity.Slug, dto.Name.Get("en"), id, ct);
        entity.Name = dto.Name;
        entity.ShortDescription = dto.ShortDescription;
        entity.LongDescription = dto.LongDescription;
        entity.Origin = dto.Origin;
        entity.Season = dto.Season;
        entity.Calibers = dto.Calibers;
        entity.PackagingDetails = dto.PackagingDetails;
        entity.IsFeatured = dto.IsFeatured;
        entity.IsActive = dto.IsActive;
        entity.SortOrder = dto.SortOrder;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Products.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return false;
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<ProductImageDto?> AddImageAsync(int productId, ProductImageUpsertDto dto, CancellationToken ct = default)
    {
        var product = await _db.Products.Include(x => x.Images).SingleOrDefaultAsync(x => x.Id == productId, ct);
        if (product is null) return null;

        if (dto.IsCover)
        {
            foreach (var img in product.Images) img.IsCover = false;
        }

        var image = new ProductImage
        {
            ProductId = productId,
            Url = dto.Url,
            Alt = dto.Alt,
            SortOrder = dto.SortOrder,
            IsCover = dto.IsCover
        };
        _db.ProductImages.Add(image);
        await _db.SaveChangesAsync(ct);
        return new ProductImageDto
        {
            Id = image.Id,
            Url = image.Url,
            Alt = image.Alt,
            SortOrder = image.SortOrder,
            IsCover = image.IsCover
        };
    }

    public async Task<bool> RemoveImageAsync(int productId, int imageId, CancellationToken ct = default)
    {
        var image = await _db.ProductImages.SingleOrDefaultAsync(x => x.Id == imageId && x.ProductId == productId, ct);
        if (image is null) return false;
        _db.ProductImages.Remove(image);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static ProductPublicListItemDto MapPublicListItem(Product p, string locale) => new()
    {
        Id = p.Id,
        Slug = p.Slug,
        Name = p.Name.Get(locale),
        ShortDescription = p.ShortDescription.Get(locale),
        CategorySlug = p.Category?.Slug ?? string.Empty,
        CategoryName = p.Category?.Name.Get(locale) ?? string.Empty,
        CoverImageUrl = p.Images.OrderByDescending(i => i.IsCover).ThenBy(i => i.SortOrder).FirstOrDefault()?.Url,
        IsFeatured = p.IsFeatured
    };

    private static ProductAdminDto MapAdmin(Product p) => new()
    {
        Id = p.Id,
        CategoryId = p.CategoryId,
        CategorySlug = p.Category?.Slug ?? string.Empty,
        Slug = p.Slug,
        Name = p.Name,
        ShortDescription = p.ShortDescription,
        LongDescription = p.LongDescription,
        Origin = p.Origin,
        Season = p.Season,
        Calibers = p.Calibers,
        PackagingDetails = p.PackagingDetails,
        IsFeatured = p.IsFeatured,
        IsActive = p.IsActive,
        SortOrder = p.SortOrder,
        Images = p.Images.OrderByDescending(i => i.IsCover).ThenBy(i => i.SortOrder).Select(i => new ProductImageDto
        {
            Id = i.Id,
            Url = i.Url,
            Alt = i.Alt,
            SortOrder = i.SortOrder,
            IsCover = i.IsCover
        }).ToList()
    };

    private async Task<string> BuildUniqueSlugAsync(string? requested, string fallbackSource, int? excludeId, CancellationToken ct)
    {
        var baseSlug = !string.IsNullOrWhiteSpace(requested)
            ? SlugHelper.Slugify(requested)
            : SlugHelper.Slugify(fallbackSource);
        if (string.IsNullOrWhiteSpace(baseSlug)) baseSlug = $"product-{DateTime.UtcNow.Ticks}";

        var slug = baseSlug;
        var i = 1;
        while (await _db.Products.AnyAsync(p => p.Slug == slug && (excludeId == null || p.Id != excludeId), ct))
        {
            slug = $"{baseSlug}-{++i}";
        }
        return slug;
    }
}
