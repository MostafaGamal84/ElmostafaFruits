using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API.Modules.Portfolio.Dtos;

public class ProductDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("name_ar")]
    public string? NameAr { get; set; }

    public string Category { get; set; } = string.Empty;
    public List<string> Origin { get; set; } = [];
    public List<string> Varieties { get; set; } = [];
    public string ImageUrl { get; set; } = string.Empty;

    [JsonPropertyName("image_filter")]
    public string? ImageFilter { get; set; }

    public string Status { get; set; } = string.Empty;
    public DateTimeOffset UpdatedAt { get; set; }
    public string? Note { get; set; }
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("description_ar")]
    public string? DescriptionAr { get; set; }
}

public class ProductCreateDto
{
    [Required, MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("name_ar")]
    [MaxLength(255)]
    public string? NameAr { get; set; }

    [Required, MaxLength(40)]
    public string Category { get; set; } = string.Empty;

    public List<string> Origin { get; set; } = [];
    public List<string> Varieties { get; set; } = [];

    [Required, MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [JsonPropertyName("image_filter")]
    [MaxLength(100)]
    public string? ImageFilter { get; set; }

    [MaxLength(40)]
    public string Status { get; set; } = "Draft";

    public string? Note { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("description_ar")]
    public string? DescriptionAr { get; set; }
}

public class ProductUpdateDto
{
    [MaxLength(255)]
    public string? Name { get; set; }

    [JsonPropertyName("name_ar")]
    [MaxLength(255)]
    public string? NameAr { get; set; }

    [MaxLength(40)]
    public string? Category { get; set; }

    public List<string>? Origin { get; set; }
    public List<string>? Varieties { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("image_filter")]
    [MaxLength(100)]
    public string? ImageFilter { get; set; }

    [MaxLength(40)]
    public string? Status { get; set; }

    public string? Note { get; set; }
    public string? Description { get; set; }

    [JsonPropertyName("description_ar")]
    public string? DescriptionAr { get; set; }
}

public class OriginDto
{
    public string Id { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    [JsonPropertyName("country_ar")]
    public string? CountryAr { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public List<string> Products { get; set; } = [];
}

public class OriginCreateDto
{
    [Required, MaxLength(10)]
    public string Id { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Country { get; set; } = string.Empty;

    [JsonPropertyName("country_ar")]
    [MaxLength(100)]
    public string? CountryAr { get; set; }

    [Range(-90d, 90d)]
    public double? Latitude { get; set; }

    [Range(-180d, 180d)]
    public double? Longitude { get; set; }
}

public class OriginUpdateDto
{
    [MaxLength(100)]
    public string? Country { get; set; }

    [JsonPropertyName("country_ar")]
    [MaxLength(100)]
    public string? CountryAr { get; set; }

    [Range(-90d, 90d)]
    public double? Latitude { get; set; }

    [Range(-180d, 180d)]
    public double? Longitude { get; set; }
}

public class MessageCreateDto
{
    [Required, MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;
}

public class MessageDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class VisualOverrideDto
{
    public string Id { get; set; } = string.Empty;
    public string NodeId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class VisualOverrideUpsertDto
{
    [Required, MaxLength(255)]
    public string NodeId { get; set; } = string.Empty;

    [Required, MaxLength(40)]
    public string Type { get; set; } = "text";

    [Required, MaxLength(10)]
    public string Scope { get; set; } = "global";

    [Required]
    public string Value { get; set; } = string.Empty;
}
