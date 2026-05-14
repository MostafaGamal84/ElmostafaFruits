using API.Modules.Catalog.Dtos;

namespace API.Modules.Catalog.Interfaces;

public class ProductFilter
{
    public string? CategorySlug { get; set; }
    public bool? IsFeatured { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public interface IProductService
{
    Task<PagedResult<ProductPublicListItemDto>> ListPublicAsync(ProductFilter filter, string locale, CancellationToken ct = default);
    Task<ProductPublicDetailDto?> GetPublicBySlugAsync(string slug, string locale, CancellationToken ct = default);

    Task<PagedResult<ProductAdminDto>> ListAdminAsync(ProductFilter filter, CancellationToken ct = default);
    Task<ProductAdminDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ProductAdminDto> CreateAsync(ProductUpsertDto dto, CancellationToken ct = default);
    Task<ProductAdminDto?> UpdateAsync(int id, ProductUpsertDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);

    Task<ProductImageDto?> AddImageAsync(int productId, ProductImageUpsertDto dto, CancellationToken ct = default);
    Task<bool> RemoveImageAsync(int productId, int imageId, CancellationToken ct = default);
}
