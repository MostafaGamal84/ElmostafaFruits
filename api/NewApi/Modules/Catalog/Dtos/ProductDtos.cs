using System.ComponentModel.DataAnnotations;
using API.Common.Localization;

namespace API.Modules.Catalog.Dtos;

public class ProductImageDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public TranslatedText Alt { get; set; } = new();
    public int SortOrder { get; set; }
    public bool IsCover { get; set; }
}

public class ProductImagePublicDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Alt { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsCover { get; set; }
}

public class ProductImageUpsertDto
{
    [Required]
    [MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    public TranslatedText Alt { get; set; } = new();
    public int SortOrder { get; set; }
    public bool IsCover { get; set; }
}

public class ProductAdminDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategorySlug { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Name { get; set; } = new();
    public TranslatedText ShortDescription { get; set; } = new();
    public TranslatedText LongDescription { get; set; } = new();
    public TranslatedText Origin { get; set; } = new();
    public TranslatedText Season { get; set; } = new();
    public TranslatedText Calibers { get; set; } = new();
    public TranslatedText PackagingDetails { get; set; } = new();
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
}

public class ProductPublicListItemDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public bool IsFeatured { get; set; }
}

public class ProductPublicDetailDto : ProductPublicListItemDto
{
    public string LongDescription { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public string Calibers { get; set; } = string.Empty;
    public string PackagingDetails { get; set; } = string.Empty;
    public List<ProductImagePublicDto> Images { get; set; } = new();
}

public class ProductUpsertDto
{
    [Required]
    public int CategoryId { get; set; }

    [MaxLength(160)]
    public string? Slug { get; set; }

    [Required]
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
}
