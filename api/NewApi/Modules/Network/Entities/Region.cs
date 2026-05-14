using API.Common.Domain;
using API.Common.Localization;

namespace API.Modules.Network.Entities;

public class Region : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Name { get; set; } = new();
    public TranslatedText Description { get; set; } = new();
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
