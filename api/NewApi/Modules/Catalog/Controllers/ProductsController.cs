using API.Common.Localization;
using API.Modules.Catalog.Dtos;
using API.Modules.Catalog.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Catalog.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service) => _service = service;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductPublicListItemDto>>> List(
        [FromQuery] string? category,
        [FromQuery] bool? featured,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var locale = RequestLocale.Resolve(Request);
        var filter = new ProductFilter
        {
            CategorySlug = category,
            IsFeatured = featured,
            Search = search,
            Page = page,
            PageSize = pageSize
        };
        return await _service.ListPublicAsync(filter, locale, ct);
    }

    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductPublicDetailDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var locale = RequestLocale.Resolve(Request);
        var result = await _service.GetPublicBySlugAsync(slug, locale, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin")]
    public async Task<ActionResult<PagedResult<ProductAdminDto>>> ListAdmin(
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        return await _service.ListAdminAsync(new ProductFilter
        {
            CategorySlug = category,
            Page = page,
            PageSize = pageSize
        }, ct);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin/{id:int}")]
    public async Task<ActionResult<ProductAdminDto>> GetByIdAdmin(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<ProductAdminDto>> Create([FromBody] ProductUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetByIdAdmin), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductAdminDto>> Update(int id, [FromBody] ProductUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var updated = await _service.UpdateAsync(id, dto, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await _service.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost("{id:int}/images")]
    public async Task<ActionResult<ProductImageDto>> AddImage(int id, [FromBody] ProductImageUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var image = await _service.AddImageAsync(id, dto, ct);
        return image is null ? NotFound() : Ok(image);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpDelete("{id:int}/images/{imageId:int}")]
    public async Task<IActionResult> RemoveImage(int id, int imageId, CancellationToken ct)
        => await _service.RemoveImageAsync(id, imageId, ct) ? NoContent() : NotFound();
}
