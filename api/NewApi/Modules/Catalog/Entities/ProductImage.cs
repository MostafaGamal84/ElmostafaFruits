using API.Common.Domain;
using API.Common.Localization;

namespace API.Modules.Catalog.Entities;

public class ProductImage : BaseEntity
{
    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public string Url { get; set; } = string.Empty;
    public TranslatedText Alt { get; set; } = new();
    public int SortOrder { get; set; }
    public bool IsCover { get; set; }
}
