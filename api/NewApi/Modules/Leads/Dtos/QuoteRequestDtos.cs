using System.ComponentModel.DataAnnotations;
using API.Modules.Leads.Entities;

namespace API.Modules.Leads.Dtos;

public class QuoteRequestPublicSubmitDto
{
    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Company { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Country { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(40)]
    public string? Phone { get; set; }

    [MaxLength(80)]
    public string? Quantity { get; set; }

    public int? ProductId { get; set; }

    [MaxLength(4000)]
    public string? Message { get; set; }

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    [MaxLength(8)]
    public string Locale { get; set; } = "en";

    public string? RecaptchaToken { get; set; }

    [MaxLength(64)]
    public string? Honeypot { get; set; }
}

public class QuoteRequestAdminDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Quantity { get; set; }
    public int? ProductId { get; set; }
    public string? ProductSlug { get; set; }
    public string? Message { get; set; }
    public string? AttachmentUrl { get; set; }
    public string Locale { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public QuoteRequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class QuoteRequestStatusUpdateDto
{
    [Required]
    public QuoteRequestStatus Status { get; set; }
}

public class QuoteRequestFilterDto
{
    public QuoteRequestStatus? Status { get; set; }
    public string? Search { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 25;
}
