namespace API.Modules.Cms.Entities;

public class SiteSetting
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Key { get; set; } = string.Empty;
    public string Type { get; set; } = "text";
    public string? DraftValue { get; set; }
    public string? PublishedValue { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? PublishedAt { get; set; }
}
