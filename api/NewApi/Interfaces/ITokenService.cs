using API.Entities;

namespace API.Interfaces;

public record AccessToken(string Value, DateTime ExpiresAt);

public interface ITokenService
{
    AccessToken CreateToken(AppUser user, IEnumerable<string> roles);
    string CreateRefreshToken();
}
