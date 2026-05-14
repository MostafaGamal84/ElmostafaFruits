using API.Common.Localization;
using API.Modules.Content.Dtos;
using API.Modules.Content.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Content.Controllers;

[ApiController]
[Route("api/pages")]
public class StaticPagesController : ControllerBase
{
    private readonly IStaticPageService _service;

    public StaticPagesController(IStaticPageService service) => _service = service;

    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<ActionResult<StaticPagePublicDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var locale = RequestLocale.Resolve(Request);
        var result = await _service.GetPublicBySlugAsync(slug, locale, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin")]
    public async Task<ActionResult<List<StaticPageAdminDto>>> ListAdmin(CancellationToken ct)
        => await _service.ListAdminAsync(ct);

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin/{id:int}")]
    public async Task<ActionResult<StaticPageAdminDto>> GetByIdAdmin(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<StaticPageAdminDto>> Upsert([FromBody] StaticPageUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        return await _service.UpsertAsync(dto, ct);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await _service.DeleteAsync(id, ct) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/milestones")]
public class MilestonesController : ControllerBase
{
    private readonly IMilestoneService _service;

    public MilestonesController(IMilestoneService service) => _service = service;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<MilestonePublicDto>>> List(CancellationToken ct)
    {
        var locale = RequestLocale.Resolve(Request);
        return await _service.ListPublicAsync(locale, ct);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin")]
    public async Task<ActionResult<List<MilestoneAdminDto>>> ListAdmin(CancellationToken ct)
        => await _service.ListAdminAsync(ct);

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<MilestoneAdminDto>> Create([FromBody] MilestoneUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        return await _service.CreateAsync(dto, ct);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<MilestoneAdminDto>> Update(int id, [FromBody] MilestoneUpsertDto dto, CancellationToken ct)
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
