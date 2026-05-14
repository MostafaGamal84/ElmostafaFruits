namespace API.Modules.Portfolio.Entities;

public class AuthVerificationCode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int UserId { get; set; }
    public AppUser? User { get; set; }

    public string Email { get; set; } = string.Empty;
    public string CodeHash { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public string? RequestedIp { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UsedAt { get; set; }
}
