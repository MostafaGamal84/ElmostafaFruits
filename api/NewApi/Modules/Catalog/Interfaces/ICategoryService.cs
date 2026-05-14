using API.Modules.Catalog.Dtos;

namespace API.Modules.Catalog.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryAdminDto>> ListAdminAsync(CancellationToken ct = default);
    Task<List<CategoryPublicDto>> ListPublicAsync(string locale, CancellationToken ct = default);
    Task<CategoryAdminDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CategoryPublicDto?> GetPublicBySlugAsync(string slug, string locale, CancellationToken ct = default);
    Task<CategoryAdminDto> CreateAsync(CategoryUpsertDto dto, CancellationToken ct = default);
    Task<CategoryAdminDto?> UpdateAsync(int id, CategoryUpsertDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
