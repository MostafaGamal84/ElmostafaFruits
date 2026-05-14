namespace API.Modules.Portfolio.Entities;

public class Origin
{
    public string Id { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? CountryAr { get; set; }
    public string? Focus { get; set; }
    public int FeaturedItems { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string Status { get; set; } = "Active";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
