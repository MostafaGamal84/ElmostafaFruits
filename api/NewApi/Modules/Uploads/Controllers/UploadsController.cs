using API.Modules.Uploads.Dtos;
using API.Modules.Uploads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Uploads.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize(Roles = "Admin,Editor")]
public class UploadsController : ControllerBase
{
    private readonly IImageUploadService _service;

    public UploadsController(IImageUploadService service) => _service = service;

    [HttpPost("images")]
    [RequestSizeLimit(8 * 1024 * 1024)]
    public async Task<ActionResult<UploadResultDto>> UploadImage(
        [FromForm] IFormFile file,
        [FromForm] string? folder = "products",
        [FromForm] int maxWidth = 2000,
        CancellationToken ct = default)
    {
        try
        {
            var result = await _service.SaveAsync(file, folder ?? "products", maxWidth, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
