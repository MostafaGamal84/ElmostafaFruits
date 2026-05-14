using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API.Entities;
using API.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService : ITokenService
{
    private readonly SymmetricSecurityKey _key;
    private readonly TimeSpan _accessTokenLifetime = TimeSpan.FromHours(2);

    public TokenService(IConfiguration config)
    {
        var tokenKey = config["TokenKey"];
        if (string.IsNullOrWhiteSpace(tokenKey))
        {
            throw new InvalidOperationException("TokenKey is missing from configuration.");
        }

        if (Encoding.UTF8.GetByteCount(tokenKey) < 64)
        {
            throw new InvalidOperationException("TokenKey must be at least 64 bytes for HmacSha512.");
        }

        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
    }

    public AccessToken CreateToken(AppUser user, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.NameId, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty)
        };

        foreach (var role in roles.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);
        var expires = DateTime.UtcNow.Add(_accessTokenLifetime);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expires,
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        return new AccessToken(token, expires);
    }

    public string CreateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(48);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }
}
