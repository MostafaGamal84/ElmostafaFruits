using API.Common.Domain;
using API.Modules.Catalog.Entities;

namespace API.Modules.Leads.Entities;

public enum QuoteRequestStatus
{
    New = 0,
    InReview = 1,
    Contacted = 2,
    Closed = 3
}

public class QuoteRequest : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Quantity { get; set; }

    public int? ProductId { get; set; }
    public Product? Product { get; set; }

    public string? Message { get; set; }
    public string? AttachmentUrl { get; set; }

    public string Locale { get; set; } = "en";
    public string? IpAddress { get; set; }
    public QuoteRequestStatus Status { get; set; } = QuoteRequestStatus.New;
}
