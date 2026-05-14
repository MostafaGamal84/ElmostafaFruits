using API.Modules.Portfolio.Dtos;
using API.Modules.Portfolio.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Modules.Portfolio.Controllers;

[ApiController]
[Route("api/v1/messages")]
public class MessagesController : ControllerBase
{
    private readonly DataContext _db;

    public MessagesController(DataContext db) => _db = db;

    [AllowAnonymous]
    [EnableRateLimiting("public-submit")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MessageCreateDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var message = new PublicMessage
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Subject = dto.Subject.Trim(),
            Message = dto.Message.Trim(),
            Summary = BuildSummary(dto.Message),
            Status = PortfolioConstants.NormalizeMessageStatus("New"),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.PublicMessages.Add(message);
        await _db.SaveChangesAsync(ct);

        return StatusCode(StatusCodes.Status201Created, new { id = message.Id.ToString(), success = true });
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpGet]
    public async Task<ActionResult<List<MessageDto>>> GetAll(CancellationToken ct)
    {
        var messages = await _db.PublicMessages
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

        return Ok(messages.Select(ToDto).ToList());
    }

    private static string BuildSummary(string value)
    {
        var normalized = value.Trim();
        return normalized.Length <= 140 ? normalized : $"{normalized[..137]}...";
    }

    private static MessageDto ToDto(PublicMessage message) => new()
    {
        Id = message.Id.ToString(),
        Name = message.Name,
        Email = message.Email,
        Subject = message.Subject,
        Summary = message.Summary ?? BuildSummary(message.Message),
        Status = message.Status,
        CreatedAt = message.CreatedAt
    };
}
