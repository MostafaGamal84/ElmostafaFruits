using API.Common.Localization;
using API.Modules.Network.Dtos;
using API.Modules.Network.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Network.Controllers;

[ApiController]
[Route("api/regions")]
public class RegionsController : ControllerBase
{
    private readonly IRegionService _service;

    public RegionsController(IRegionService service) => _service = service;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<RegionPublicDto>>> List(CancellationToken ct)
    {
        var locale = RequestLocale.Resolve(Request);
        return await _service.ListPublicAsync(locale, ct);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin")]
    public async Task<ActionResult<List<RegionAdminDto>>> ListAdmin(CancellationToken ct)
        => await _service.ListAdminAsync(ct);

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin/{id:int}")]
    public async Task<ActionResult<RegionAdminDto>> GetByIdAdmin(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<RegionAdminDto>> Create([FromBody] RegionUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetByIdAdmin), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<RegionAdminDto>> Update(int id, [FromBody] RegionUpsertDto dto, CancellationToken ct)
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
[Route("api/stats")]
public class StatsController : ControllerBase
{
    private readonly IStatService _service;

    public StatsController(IStatService service) => _service = service;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<StatPublicDto>>> List(CancellationToken ct)
    {
        var locale = RequestLocale.Resolve(Request);
        return await _service.ListPublicAsync(locale, ct);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("admin")]
    public async Task<ActionResult<List<StatAdminDto>>> ListAdmin(CancellationToken ct)
        => await _service.ListAdminAsync(ct);

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<StatAdminDto>> Upsert([FromBody] StatUpsertDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        return await _service.UpsertAsync(dto, ct);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await _service.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
