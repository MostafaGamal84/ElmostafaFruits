using API.Common.Recaptcha;
using API.Modules.Catalog.Interfaces;
using API.Modules.Leads.Dtos;
using API.Modules.Leads.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Modules.Leads.Controllers;

[ApiController]
[Route("api/quotes")]
public class QuoteRequestsController : ControllerBase
{
    private readonly IQuoteRequestService _service;
    private readonly IRecaptchaVerifier _recaptcha;

    public QuoteRequestsController(IQuoteRequestService service, IRecaptchaVerifier recaptcha)
    {
        _service = service;
        _recaptcha = recaptcha;
    }

    [AllowAnonymous]
    [EnableRateLimiting("public-submit")]
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] QuoteRequestPublicSubmitDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        if (!string.IsNullOrWhiteSpace(dto.Honeypot))
        {
            return NoContent();
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var captchaOk = await _recaptcha.VerifyAsync(dto.RecaptchaToken, ip, ct);
        if (!captchaOk)
        {
            return BadRequest(new { message = "reCAPTCHA verification failed" });
        }

        var id = await _service.SubmitAsync(dto, ip, ct);
        return Accepted(new { id });
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet]
    public async Task<ActionResult<PagedResult<QuoteRequestAdminDto>>> List([FromQuery] QuoteRequestFilterDto filter, CancellationToken ct)
        => await _service.ListAdminAsync(filter, ct);

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuoteRequestAdminDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] QuoteRequestStatusUpdateDto dto, CancellationToken ct)
        => await _service.UpdateStatusAsync(id, dto.Status, ct) ? NoContent() : NotFound();

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await _service.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("export.csv")]
    public async Task<IActionResult> Export([FromQuery] QuoteRequestFilterDto filter, CancellationToken ct)
    {
        var bytes = await _service.ExportCsvAsync(filter, ct);
        return File(bytes, "text/csv", $"quotes-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
    }
}
