using API.Common.Domain;
using API.Common.Localization;

namespace API.Modules.Catalog.Entities;

public class Product : BaseEntity
{
    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public string Slug { get; set; } = string.Empty;
    public TranslatedText Name { get; set; } = new();
    public TranslatedText ShortDescription { get; set; } = new();
    public TranslatedText LongDescription { get; set; } = new();
    public TranslatedText Origin { get; set; } = new();
    public TranslatedText Season { get; set; } = new();
    public TranslatedText Calibers { get; set; } = new();
    public TranslatedText PackagingDetails { get; set; } = new();

    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}
