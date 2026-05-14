using API.Data;
using API.Modules.Content.Dtos;
using API.Modules.Content.Entities;
using API.Modules.Content.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.Content.Services;

public class MilestoneService : IMilestoneService
{
    private readonly DataContext _db;

    public MilestoneService(DataContext db) => _db = db;

    public async Task<List<MilestoneAdminDto>> ListAdminAsync(CancellationToken ct = default)
    {
        return await _db.Milestones
            .AsNoTracking().Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Year)
            .Select(x => new MilestoneAdminDto
            {
                Id = x.Id, Year = x.Year, Title = x.Title, Description = x.Description, SortOrder = x.SortOrder
            })
            .ToListAsync(ct);
    }

    public async Task<List<MilestonePublicDto>> ListPublicAsync(string locale, CancellationToken ct = default)
    {
        var entities = await _db.Milestones
            .AsNoTracking().Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Year)
            .ToListAsync(ct);
        return entities.Select(x => new MilestonePublicDto
        {
            Id = x.Id, Year = x.Year,
            Title = x.Title.Get(locale),
            Description = x.Description.Get(locale),
            SortOrder = x.SortOrder
        }).ToList();
    }

    public async Task<MilestoneAdminDto> CreateAsync(MilestoneUpsertDto dto, CancellationToken ct = default)
    {
        var entity = new Milestone
        {
            Year = dto.Year,
            Title = dto.Title,
            Description = dto.Description,
            SortOrder = dto.SortOrder
        };
        _db.Milestones.Add(entity);
        await _db.SaveChangesAsync(ct);
        return new MilestoneAdminDto
        {
            Id = entity.Id, Year = entity.Year, Title = entity.Title, Description = entity.Description, SortOrder = entity.SortOrder
        };
    }

    public async Task<MilestoneAdminDto?> UpdateAsync(int id, MilestoneUpsertDto dto, CancellationToken ct = default)
    {
        var entity = await _db.Milestones.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return null;
        entity.Year = dto.Year;
        entity.Title = dto.Title;
        entity.Description = dto.Description;
        entity.SortOrder = dto.SortOrder;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new MilestoneAdminDto
        {
            Id = entity.Id, Year = entity.Year, Title = entity.Title, Description = entity.Description, SortOrder = entity.SortOrder
        };
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Milestones.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return false;
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
