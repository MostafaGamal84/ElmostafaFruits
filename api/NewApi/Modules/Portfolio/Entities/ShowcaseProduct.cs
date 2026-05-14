namespace API.Modules.Portfolio.Entities;

public class ShowcaseProduct
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? NameAr { get; set; }
    public string Category { get; set; } = "tropical";
    public string ImageUrl { get; set; } = string.Empty;
    public string? ImageFilter { get; set; }
    public string OriginJson { get; set; } = "[]";
    public string VarietiesJson { get; set; } = "[]";
    public string Description { get; set; } = string.Empty;
    public string? DescriptionAr { get; set; }
    public string? Note { get; set; }
    public string Status { get; set; } = "Draft";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
