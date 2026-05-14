using API.Common.Domain;
using API.Common.Localization;

namespace API.Modules.Content.Entities;

public class Article : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Title { get; set; } = new();
    public TranslatedText Excerpt { get; set; } = new();
    public TranslatedText Body { get; set; } = new();
    public string? CoverImageUrl { get; set; }

    public int? CategoryId { get; set; }
    public ArticleCategory? Category { get; set; }

    public DateTime? PublishedAt { get; set; }
    public bool IsPublished { get; set; }
}
