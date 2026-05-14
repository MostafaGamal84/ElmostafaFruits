namespace API.Modules.Portfolio.Entities;

public class PublicMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Status { get; set; } = "New";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
