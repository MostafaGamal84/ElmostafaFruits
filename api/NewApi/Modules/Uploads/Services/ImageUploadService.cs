using API.Modules.Uploads.Dtos;
using Microsoft.AspNetCore.Hosting;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using API.Data;
using API.Modules.Cms.Entities;

namespace API.Modules.Uploads.Services;

public interface IImageUploadService
{
    Task<UploadResultDto> SaveAsync(IFormFile file, string subfolder, int? maxWidth = 2000, CancellationToken ct = default);
}

public class ImageUploadService : IImageUploadService
{
    private static readonly string[] AllowedContentTypes =
        { "image/jpeg", "image/png", "image/webp", "image/gif" };

    private const long MaxBytes = 8 * 1024 * 1024;

    private readonly IWebHostEnvironment _env;
    private readonly DataContext _db;

    public ImageUploadService(IWebHostEnvironment env, DataContext db)
    {
        _env = env;
        _db = db;
    }

    public async Task<UploadResultDto> SaveAsync(IFormFile file, string subfolder, int? maxWidth = 2000, CancellationToken ct = default)
    {
        if (file is null || file.Length == 0)
            throw new InvalidOperationException("Empty file");
        if (file.Length > MaxBytes)
            throw new InvalidOperationException("File too large (max 8MB)");
        if (!AllowedContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException("Unsupported image type");

        var safeSub = string.Concat((subfolder ?? "general").Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_')).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(safeSub)) safeSub = "general";

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads", safeSub);
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}.webp";
        var fullPath = Path.Combine(uploadsDir, fileName);

        await using var input = file.OpenReadStream();
        using var image = await Image.LoadAsync(input, ct);

        if (maxWidth.HasValue && image.Width > maxWidth.Value)
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(maxWidth.Value, 0)
            }));
        }

        var encoder = new WebpEncoder { Quality = 82 };
        await image.SaveAsync(fullPath, encoder, ct);

        var fi = new FileInfo(fullPath);
        var url = $"/uploads/{safeSub}/{fileName}";

        _db.MediaAssets.Add(new MediaAsset
        {
            FileName = fileName,
            OriginalFileName = file.FileName,
            Url = url,
            Folder = safeSub,
            ContentType = file.ContentType,
            Size = fi.Length,
            Width = image.Width,
            Height = image.Height,
            CreatedAt = DateTimeOffset.UtcNow
        });
        await _db.SaveChangesAsync(ct);

        return new UploadResultDto
        {
            Url = url,
            FileName = fileName,
            Size = fi.Length,
            Width = image.Width,
            Height = image.Height
        };
    }
}
