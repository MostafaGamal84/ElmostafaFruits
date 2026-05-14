namespace API.Modules.Cms.Entities;

public class ContentEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string NodeId { get; set; } = string.Empty;
    public string Type { get; set; } = "text";
    public string Scope { get; set; } = "global";
    public string? DraftValue { get; set; }
    public string? PublishedValue { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? PublishedAt { get; set; }
}
