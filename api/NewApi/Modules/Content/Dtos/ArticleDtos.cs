using System.ComponentModel.DataAnnotations;
using API.Common.Localization;

namespace API.Modules.Content.Dtos;

public class ArticleCategoryAdminDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Name { get; set; } = new();
}

public class ArticleCategoryPublicDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class ArticleCategoryUpsertDto
{
    [MaxLength(160)]
    public string? Slug { get; set; }

    [Required]
    public TranslatedText Name { get; set; } = new();
}

public class ArticleAdminDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Title { get; set; } = new();
    public TranslatedText Excerpt { get; set; } = new();
    public TranslatedText Body { get; set; } = new();
    public string? CoverImageUrl { get; set; }
    public int? CategoryId { get; set; }
    public string? CategorySlug { get; set; }
    public DateTime? PublishedAt { get; set; }
    public bool IsPublished { get; set; }
}

public class ArticlePublicListItemDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? CategorySlug { get; set; }
    public string? CategoryName { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class ArticlePublicDetailDto : ArticlePublicListItemDto
{
    public string Body { get; set; } = string.Empty;
}

public class ArticleUpsertDto
{
    [MaxLength(160)]
    public string? Slug { get; set; }

    [Required]
    public TranslatedText Title { get; set; } = new();
    public TranslatedText Excerpt { get; set; } = new();

    [Required]
    public TranslatedText Body { get; set; } = new();

    [MaxLength(500)]
    public string? CoverImageUrl { get; set; }

    public int? CategoryId { get; set; }
    public DateTime? PublishedAt { get; set; }
    public bool IsPublished { get; set; }
}
