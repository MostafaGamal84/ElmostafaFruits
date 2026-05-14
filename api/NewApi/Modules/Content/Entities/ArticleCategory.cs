using API.Common.Domain;
using API.Common.Localization;

namespace API.Modules.Content.Entities;

public class ArticleCategory : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Name { get; set; } = new();

    public ICollection<Article> Articles { get; set; } = new List<Article>();
}
