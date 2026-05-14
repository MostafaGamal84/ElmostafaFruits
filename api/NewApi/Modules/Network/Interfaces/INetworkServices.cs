using API.Modules.Network.Dtos;

namespace API.Modules.Network.Interfaces;

public interface IRegionService
{
    Task<List<RegionAdminDto>> ListAdminAsync(CancellationToken ct = default);
    Task<List<RegionPublicDto>> ListPublicAsync(string locale, CancellationToken ct = default);
    Task<RegionAdminDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<RegionAdminDto> CreateAsync(RegionUpsertDto dto, CancellationToken ct = default);
    Task<RegionAdminDto?> UpdateAsync(int id, RegionUpsertDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

public interface IStatService
{
    Task<List<StatAdminDto>> ListAdminAsync(CancellationToken ct = default);
    Task<List<StatPublicDto>> ListPublicAsync(string locale, CancellationToken ct = default);
    Task<StatAdminDto> UpsertAsync(StatUpsertDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
