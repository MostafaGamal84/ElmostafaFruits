namespace API.Modules.Cms.Entities;

public class MediaAsset
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Folder { get; set; } = "general";
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
