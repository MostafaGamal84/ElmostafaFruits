using System.ComponentModel.DataAnnotations;
using API.Common.Localization;

namespace API.Modules.Network.Dtos;

public class RegionAdminDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Name { get; set; } = new();
    public TranslatedText Description { get; set; } = new();
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class RegionPublicDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
}

public class RegionUpsertDto
{
    [MaxLength(160)]
    public string? Slug { get; set; }

    [Required]
    public TranslatedText Name { get; set; } = new();
    public TranslatedText Description { get; set; } = new();
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class StatAdminDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public TranslatedText Label { get; set; } = new();
    public string Value { get; set; } = string.Empty;
    public string? Unit { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
}

public class StatPublicDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Unit { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
}

public class StatUpsertDto
{
    [Required]
    [MaxLength(80)]
    public string Key { get; set; } = string.Empty;

    [Required]
    public TranslatedText Label { get; set; } = new();

    [Required]
    [MaxLength(80)]
    public string Value { get; set; } = string.Empty;

    [MaxLength(40)]
    public string? Unit { get; set; }

    [MaxLength(120)]
    public string? Icon { get; set; }

    public int SortOrder { get; set; }
}
