using API.Common.Domain;

namespace API.Modules.Newsletter.Entities;

public class NewsletterSubscriber : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string Locale { get; set; } = "en";

    public bool IsConfirmed { get; set; }
    public string? ConfirmToken { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? UnsubscribedAt { get; set; }

    public string? IpAddress { get; set; }
    public DateTime ConsentTimestamp { get; set; } = DateTime.UtcNow;
}
