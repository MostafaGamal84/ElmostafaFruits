using System.ComponentModel.DataAnnotations;
using API.Common.Localization;

namespace API.Modules.Content.Dtos;

public class StaticPageAdminDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Title { get; set; } = new();
    public TranslatedText Body { get; set; } = new();
}

public class StaticPagePublicDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class StaticPageUpsertDto
{
    [Required]
    [MaxLength(80)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    public TranslatedText Title { get; set; } = new();

    [Required]
    public TranslatedText Body { get; set; } = new();
}

public class MilestoneAdminDto
{
    public int Id { get; set; }
    public int Year { get; set; }
    public TranslatedText Title { get; set; } = new();
    public TranslatedText Description { get; set; } = new();
    public int SortOrder { get; set; }
}

public class MilestonePublicDto
{
    public int Id { get; set; }
    public int Year { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class MilestoneUpsertDto
{
    [Required]
    public int Year { get; set; }

    [Required]
    public TranslatedText Title { get; set; } = new();
    public TranslatedText Description { get; set; } = new();
    public int SortOrder { get; set; }
}
