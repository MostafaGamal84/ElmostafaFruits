namespace API.Entities;

public class RefreshToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public AppUser? User { get; set; }

    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }

    public bool IsActive => RevokedAt is null && DateTime.UtcNow < ExpiresAt;
}
