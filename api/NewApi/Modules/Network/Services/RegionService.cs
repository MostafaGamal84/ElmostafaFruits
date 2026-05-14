using API.Common.Web;
using API.Data;
using API.Modules.Network.Dtos;
using API.Modules.Network.Entities;
using API.Modules.Network.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.Network.Services;

public class RegionService : IRegionService
{
    private readonly DataContext _db;

    public RegionService(DataContext db) => _db = db;

    public async Task<List<RegionAdminDto>> ListAdminAsync(CancellationToken ct = default)
    {
        return await _db.Regions
            .AsNoTracking().Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .Select(x => new RegionAdminDto
            {
                Id = x.Id, Slug = x.Slug, Name = x.Name, Description = x.Description,
                Latitude = x.Latitude, Longitude = x.Longitude, ImageUrl = x.ImageUrl,
                SortOrder = x.SortOrder, IsActive = x.IsActive
            })
            .ToListAsync(ct);
    }

    public async Task<List<RegionPublicDto>> ListPublicAsync(string locale, CancellationToken ct = default)
    {
        var entities = await _db.Regions
            .AsNoTracking().Where(x => !x.IsDeleted && x.IsActive)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .ToListAsync(ct);
        return entities.Select(x => new RegionPublicDto
        {
            Id = x.Id, Slug = x.Slug,
            Name = x.Name.Get(locale), Description = x.Description.Get(locale),
            Latitude = x.Latitude, Longitude = x.Longitude, ImageUrl = x.ImageUrl,
            SortOrder = x.SortOrder
        }).ToList();
    }

    public async Task<RegionAdminDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var x = await _db.Regions.AsNoTracking().SingleOrDefaultAsync(r => r.Id == id, ct);
        return x is null ? null : new RegionAdminDto
        {
            Id = x.Id, Slug = x.Slug, Name = x.Name, Description = x.Description,
            Latitude = x.Latitude, Longitude = x.Longitude, ImageUrl = x.ImageUrl,
            SortOrder = x.SortOrder, IsActive = x.IsActive
        };
    }

    public async Task<RegionAdminDto> CreateAsync(RegionUpsertDto dto, CancellationToken ct = default)
    {
        var slug = await UniqueSlug(dto.Slug, dto.Name.Get("en"), null, ct);
        var entity = new Region
        {
            Slug = slug, Name = dto.Name, Description = dto.Description,
            Latitude = dto.Latitude, Longitude = dto.Longitude, ImageUrl = dto.ImageUrl,
            SortOrder = dto.SortOrder, IsActive = dto.IsActive
        };
        _db.Regions.Add(entity);
        await _db.SaveChangesAsync(ct);
        return (await GetByIdAsync(entity.Id, ct))!;
    }

    public async Task<RegionAdminDto?> UpdateAsync(int id, RegionUpsertDto dto, CancellationToken ct = default)
    {
        var entity = await _db.Regions.SingleOrDefaultAsync(r => r.Id == id, ct);
        if (entity is null) return null;
        entity.Slug = await UniqueSlug(dto.Slug ?? entity.Slug, dto.Name.Get("en"), id, ct);
        entity.Name = dto.Name; entity.Description = dto.Description;
        entity.Latitude = dto.Latitude; entity.Longitude = dto.Longitude;
        entity.ImageUrl = dto.ImageUrl; entity.SortOrder = dto.SortOrder; entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Regions.SingleOrDefaultAsync(r => r.Id == id, ct);
        if (entity is null) return false;
        entity.IsDeleted = true; entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private async Task<string> UniqueSlug(string? requested, string fallback, int? excludeId, CancellationToken ct)
    {
        var baseSlug = SlugHelper.Slugify(!string.IsNullOrWhiteSpace(requested) ? requested : fallback);
        if (string.IsNullOrWhiteSpace(baseSlug)) baseSlug = $"region-{DateTime.UtcNow.Ticks}";
        var slug = baseSlug; var i = 1;
        while (await _db.Regions.AnyAsync(x => x.Slug == slug && (excludeId == null || x.Id != excludeId), ct))
            slug = $"{baseSlug}-{++i}";
        return slug;
    }
}
