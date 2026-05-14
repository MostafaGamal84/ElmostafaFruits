using API.Modules.Catalog.Interfaces;
using API.Modules.Content.Dtos;

namespace API.Modules.Content.Interfaces;

public interface IArticleCategoryService
{
    Task<List<ArticleCategoryAdminDto>> ListAdminAsync(CancellationToken ct = default);
    Task<List<ArticleCategoryPublicDto>> ListPublicAsync(string locale, CancellationToken ct = default);
    Task<ArticleCategoryAdminDto> CreateAsync(ArticleCategoryUpsertDto dto, CancellationToken ct = default);
    Task<ArticleCategoryAdminDto?> UpdateAsync(int id, ArticleCategoryUpsertDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

public class ArticleFilter
{
    public string? CategorySlug { get; set; }
    public bool? IsPublished { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public interface IArticleService
{
    Task<PagedResult<ArticlePublicListItemDto>> ListPublicAsync(ArticleFilter filter, string locale, CancellationToken ct = default);
    Task<ArticlePublicDetailDto?> GetPublicBySlugAsync(string slug, string locale, CancellationToken ct = default);

    Task<PagedResult<ArticleAdminDto>> ListAdminAsync(ArticleFilter filter, CancellationToken ct = default);
    Task<ArticleAdminDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ArticleAdminDto> CreateAsync(ArticleUpsertDto dto, CancellationToken ct = default);
    Task<ArticleAdminDto?> UpdateAsync(int id, ArticleUpsertDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

public interface IStaticPageService
{
    Task<List<StaticPageAdminDto>> ListAdminAsync(CancellationToken ct = default);
    Task<StaticPagePublicDto?> GetPublicBySlugAsync(string slug, string locale, CancellationToken ct = default);
    Task<StaticPageAdminDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<StaticPageAdminDto> UpsertAsync(StaticPageUpsertDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

public interface IMilestoneService
{
    Task<List<MilestoneAdminDto>> ListAdminAsync(CancellationToken ct = default);
    Task<List<MilestonePublicDto>> ListPublicAsync(string locale, CancellationToken ct = default);
    Task<MilestoneAdminDto> CreateAsync(MilestoneUpsertDto dto, CancellationToken ct = default);
    Task<MilestoneAdminDto?> UpdateAsync(int id, MilestoneUpsertDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
