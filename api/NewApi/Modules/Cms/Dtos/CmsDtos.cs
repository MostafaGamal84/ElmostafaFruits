using System.ComponentModel.DataAnnotations;

namespace API.Modules.Cms.Dtos;

public class ContentEntryDto
{
    public string Id { get; set; } = string.Empty;
    public string NodeId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Stage { get; set; } = "draft";
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
}

public class ContentEntryUpsertDto
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

public class ContentPublishDto
{
    public string? NodeId { get; set; }
    public string? Scope { get; set; }
    public bool PublishAll { get; set; }
}

public class SiteSettingDto
{
    public string Id { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Stage { get; set; } = "draft";
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
}

public class SiteSettingUpsertDto
{
    [Required, MaxLength(120)]
    public string Key { get; set; } = string.Empty;

    [Required, MaxLength(40)]
    public string Type { get; set; } = "text";

    [Required]
    public string Value { get; set; } = string.Empty;
}

public class SiteSettingPublishDto
{
    public string? Key { get; set; }
    public bool PublishAll { get; set; }
}

public class MediaAssetDto
{
    public string Id { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Folder { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
