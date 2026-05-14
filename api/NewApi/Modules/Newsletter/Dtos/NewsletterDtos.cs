using System.ComponentModel.DataAnnotations;

namespace API.Modules.Newsletter.Dtos;

public class NewsletterSubscribeDto
{
    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(8)]
    public string Locale { get; set; } = "en";

    public string? RecaptchaToken { get; set; }

    [MaxLength(64)]
    public string? Honeypot { get; set; }
}

public class NewsletterSubscriberAdminDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Locale { get; set; } = string.Empty;
    public bool IsConfirmed { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? UnsubscribedAt { get; set; }
    public DateTime ConsentTimestamp { get; set; }
    public string? IpAddress { get; set; }
}

public class NewsletterFilterDto
{
    public bool? IsConfirmed { get; set; }
    public bool? IsUnsubscribed { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
