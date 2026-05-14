using API.Common.Recaptcha;
using API.Modules.Catalog.Interfaces;
using API.Modules.Newsletter.Dtos;
using API.Modules.Newsletter.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Modules.Newsletter.Controllers;

[ApiController]
[Route("api/newsletter")]
public class NewsletterController : ControllerBase
{
    private readonly INewsletterService _service;
    private readonly IRecaptchaVerifier _recaptcha;

    public NewsletterController(INewsletterService service, IRecaptchaVerifier recaptcha)
    {
        _service = service;
        _recaptcha = recaptcha;
    }

    [AllowAnonymous]
    [EnableRateLimiting("public-submit")]
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscribeDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (!string.IsNullOrWhiteSpace(dto.Honeypot)) return NoContent();

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        if (!await _recaptcha.VerifyAsync(dto.RecaptchaToken, ip, ct))
        {
            return BadRequest(new { message = "reCAPTCHA verification failed" });
        }

        await _service.SubscribeAsync(dto, ip, ct);
        return Accepted(new { message = "Please check your email to confirm" });
    }

    [AllowAnonymous]
    [HttpGet("confirm")]
    public async Task<IActionResult> Confirm([FromQuery] string token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token)) return BadRequest();
        var ok = await _service.ConfirmAsync(token, ct);
        return ok ? Ok(new { confirmed = true }) : NotFound();
    }

    [AllowAnonymous]
    [HttpPost("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.EmailOrToken)) return BadRequest();
        var ok = await _service.UnsubscribeAsync(dto.EmailOrToken, ct);
        return ok ? NoContent() : NotFound();
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet]
    public async Task<ActionResult<PagedResult<NewsletterSubscriberAdminDto>>> List([FromQuery] NewsletterFilterDto filter, CancellationToken ct)
        => await _service.ListAdminAsync(filter, ct);

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await _service.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet("export.csv")]
    public async Task<IActionResult> Export([FromQuery] NewsletterFilterDto filter, CancellationToken ct)
    {
        var bytes = await _service.ExportCsvAsync(filter, ct);
        return File(bytes, "text/csv", $"newsletter-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
    }
}

public class UnsubscribeDto
{
    public string EmailOrToken { get; set; } = string.Empty;
}
