namespace API.Modules.Uploads.Dtos;

public class UploadResultDto
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long Size { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}
