using API.Data;
using API.DTOs.Auth;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(14);

    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly DataContext _db;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        ITokenService tokenService,
        DataContext db)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _db = db;
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _userManager.Users.SingleOrDefaultAsync(x => x.Email == email && !x.IsDeleted);
        if (user is null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!signInResult.Succeeded)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        return Ok(await BuildAuthResponse(user));
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var existing = await _db.RefreshTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.Token == dto.RefreshToken);

        if (existing is null || !existing.IsActive || existing.User is null || existing.User.IsDeleted)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }

        existing.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(await BuildAuthResponse(existing.User));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequestDto dto)
    {
        var existing = await _db.RefreshTokens
            .SingleOrDefaultAsync(x => x.Token == dto.RefreshToken);

        if (existing is not null && existing.RevokedAt is null)
        {
            existing.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<IActionResult> ListUsers()
    {
        var users = await _userManager.Users
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.Email)
            .ToListAsync();

        var result = new List<AdminUserDto>();
        foreach (var u in users)
        {
            result.Add(new AdminUserDto
            {
                Id = u.Id,
                Email = u.Email ?? string.Empty,
                FirstName = u.FirstName ?? string.Empty,
                LastName = u.LastName ?? string.Empty,
                Roles = await _userManager.GetRolesAsync(u),
                RegisterTime = u.RegisterTime
            });
        }

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateEditorDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _userManager.Users.AnyAsync(x => x.Email == email))
        {
            return Conflict(new { message = "Email already exists" });
        }

        var user = new AppUser
        {
            UserName = email,
            Email = email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            EmailConfirmed = true,
            RegisterTime = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new { message = string.Join("; ", createResult.Errors.Select(e => e.Description)) });
        }

        await _userManager.AddToRoleAsync(user, dto.Role);

        return CreatedAtAction(nameof(ListUsers), new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName ?? string.Empty,
            LastName = user.LastName ?? string.Empty,
            Roles = new[] { dto.Role },
            RegisterTime = user.RegisterTime
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var currentUserId = _userManager.GetUserId(User);
        if (currentUserId == id.ToString())
        {
            return BadRequest(new { message = "You cannot delete your own account" });
        }

        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null || user.IsDeleted) return NotFound();

        user.IsDeleted = true;
        await _userManager.UpdateAsync(user);

        var revokeTokens = _db.RefreshTokens.Where(x => x.UserId == id && x.RevokedAt == null);
        await revokeTokens.ForEachAsync(x => x.RevokedAt = DateTime.UtcNow);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private async Task<AuthResponseDto> BuildAuthResponse(AppUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var access = _tokenService.CreateToken(user, roles);
        var refresh = _tokenService.CreateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refresh,
            ExpiresAt = DateTime.UtcNow.Add(RefreshTokenLifetime)
        });
        await _db.SaveChangesAsync();

        return new AuthResponseDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            Roles = roles,
            Token = access.Value,
            ExpiresAt = access.ExpiresAt,
            RefreshToken = refresh
        };
    }
}
