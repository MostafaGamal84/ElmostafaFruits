using API.Common.Localization;
using API.Modules.Catalog.Dtos;
using API.Modules.Catalog.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Catalog.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _service;

    public CategoriesController(ICategoryService service) => _service = service;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<CategoryPublicDto>>> List(CancellationToken ct)
    {
        var locale = RequestLocale.Resolve(Request);
        return await _service.ListPublicAsync(locale, ct);
    }

    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<ActionResult<CategoryPublicDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var locale = RequestLocale.Resolve(Request);
        var result = await _service.GetPublicBySlugAsync(slug, locale, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin")]
    public async Task<ActionResult<List<CategoryAdminDto>>> ListAdmin(CancellationToken ct)
        => await _service.ListAdminAsync(ct);

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin/{id:int}")]
    public async Task<ActionResult<CategoryAdminDto>> GetByIdAdmin(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<CategoryAdminDto>> Create([FromBody] CategoryUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetByIdAdmin), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryAdminDto>> Update(int id, [FromBody] CategoryUpsertDto dto, CancellationToken ct)
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
