using API.Common.Domain;
using API.Common.Localization;

namespace API.Modules.Content.Entities;

public class StaticPage : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public TranslatedText Title { get; set; } = new();
    public TranslatedText Body { get; set; } = new();
}
