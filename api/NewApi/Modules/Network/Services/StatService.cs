using API.Data;
using API.Modules.Network.Dtos;
using API.Modules.Network.Entities;
using API.Modules.Network.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Modules.Network.Services;

public class StatService : IStatService
{
    private readonly DataContext _db;

    public StatService(DataContext db) => _db = db;

    public async Task<List<StatAdminDto>> ListAdminAsync(CancellationToken ct = default)
    {
        return await _db.Stats
            .AsNoTracking().Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .Select(x => new StatAdminDto
            {
                Id = x.Id, Key = x.Key, Label = x.Label, Value = x.Value,
                Unit = x.Unit, Icon = x.Icon, SortOrder = x.SortOrder
            })
            .ToListAsync(ct);
    }

    public async Task<List<StatPublicDto>> ListPublicAsync(string locale, CancellationToken ct = default)
    {
        var entities = await _db.Stats
            .AsNoTracking().Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .ToListAsync(ct);
        return entities.Select(x => new StatPublicDto
        {
            Id = x.Id, Key = x.Key, Label = x.Label.Get(locale),
            Value = x.Value, Unit = x.Unit, Icon = x.Icon, SortOrder = x.SortOrder
        }).ToList();
    }

    public async Task<StatAdminDto> UpsertAsync(StatUpsertDto dto, CancellationToken ct = default)
    {
        var entity = await _db.Stats.SingleOrDefaultAsync(x => x.Key == dto.Key, ct);
        if (entity is null)
        {
            entity = new Stat { Key = dto.Key, Label = dto.Label, Value = dto.Value, Unit = dto.Unit, Icon = dto.Icon, SortOrder = dto.SortOrder };
            _db.Stats.Add(entity);
        }
        else
        {
            entity.Label = dto.Label; entity.Value = dto.Value; entity.Unit = dto.Unit;
            entity.Icon = dto.Icon; entity.SortOrder = dto.SortOrder;
            entity.IsDeleted = false; entity.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync(ct);
        return new StatAdminDto
        {
            Id = entity.Id, Key = entity.Key, Label = entity.Label, Value = entity.Value,
            Unit = entity.Unit, Icon = entity.Icon, SortOrder = entity.SortOrder
        };
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Stats.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return false;
        entity.IsDeleted = true; entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
