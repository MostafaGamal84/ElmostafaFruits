namespace API.Modules.Portfolio.Entities;

public class VisualOverride
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string NodeId { get; set; } = string.Empty;
    public string Type { get; set; } = "text";
    public string Scope { get; set; } = "global";
    public string Value { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
