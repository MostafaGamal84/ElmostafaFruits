using API.Common.Localization;
using API.Modules.Catalog.Interfaces;
using API.Modules.Content.Dtos;
using API.Modules.Content.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Content.Controllers;

[ApiController]
[Route("api/articles")]
public class ArticlesController : ControllerBase
{
    private readonly IArticleService _service;

    public ArticlesController(IArticleService service) => _service = service;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PagedResult<ArticlePublicListItemDto>>> List(
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var locale = RequestLocale.Resolve(Request);
        return await _service.ListPublicAsync(new ArticleFilter { CategorySlug = category, Page = page, PageSize = pageSize }, locale, ct);
    }

    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<ActionResult<ArticlePublicDetailDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var locale = RequestLocale.Resolve(Request);
        var result = await _service.GetPublicBySlugAsync(slug, locale, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin")]
    public async Task<ActionResult<PagedResult<ArticleAdminDto>>> ListAdmin(
        [FromQuery] string? category,
        [FromQuery] bool? published,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        return await _service.ListAdminAsync(new ArticleFilter { CategorySlug = category, IsPublished = published, Page = page, PageSize = pageSize }, ct);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin/{id:int}")]
    public async Task<ActionResult<ArticleAdminDto>> GetByIdAdmin(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<ArticleAdminDto>> Create([FromBody] ArticleUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetByIdAdmin), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ArticleAdminDto>> Update(int id, [FromBody] ArticleUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var updated = await _service.UpdateAsync(id, dto, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await _service.DeleteAsync(id, ct) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/article-categories")]
public class ArticleCategoriesController : ControllerBase
{
    private readonly IArticleCategoryService _service;

    public ArticleCategoriesController(IArticleCategoryService service) => _service = service;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<ArticleCategoryPublicDto>>> List(CancellationToken ct)
    {
        var locale = RequestLocale.Resolve(Request);
        return await _service.ListPublicAsync(locale, ct);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin")]
    public async Task<ActionResult<List<ArticleCategoryAdminDto>>> ListAdmin(CancellationToken ct)
        => await _service.ListAdminAsync(ct);

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<ArticleCategoryAdminDto>> Create([FromBody] ArticleCategoryUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        return await _service.CreateAsync(dto, ct);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ArticleCategoryAdminDto>> Update(int id, [FromBody] ArticleCategoryUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var updated = await _service.UpdateAsync(id, dto, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await _service.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
