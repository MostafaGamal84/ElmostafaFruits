using System.ComponentModel.DataAnnotations;
using API.Common.Localization;

namespace API.Modules.Catalog.Dtos;

public class CategoryAdminDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Name { get; set; } = new();
    public TranslatedText Description { get; set; } = new();
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public int ProductCount { get; set; }
}

public class CategoryPublicDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public int ProductCount { get; set; }
}

public class CategoryUpsertDto
{
    [MaxLength(160)]
    public string? Slug { get; set; }

    [Required]
    public TranslatedText Name { get; set; } = new();

    public TranslatedText Description { get; set; } = new();

    [MaxLength(120)]
    public string? Icon { get; set; }

    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
