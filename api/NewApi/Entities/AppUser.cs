using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class AppUser : IdentityUser<int>
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime RegisterTime { get; set; } = DateTime.UtcNow;
    public virtual ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
