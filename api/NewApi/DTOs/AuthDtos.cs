using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Auth;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class RefreshRequestDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class CreateEditorDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Admin|Editor)$", ErrorMessage = "Role must be Admin or Editor")]
    public string Role { get; set; } = "Editor";
}

public class AdminUserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public IEnumerable<string> Roles { get; set; } = Enumerable.Empty<string>();
    public DateTime RegisterTime { get; set; }
}

public class AuthResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public IEnumerable<string> Roles { get; set; } = Enumerable.Empty<string>();
}
