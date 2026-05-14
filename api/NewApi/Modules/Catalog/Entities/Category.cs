using API.Common.Domain;
using API.Common.Localization;

namespace API.Modules.Catalog.Entities;

public class Category : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Name { get; set; } = new();
    public TranslatedText Description { get; set; } = new();
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
