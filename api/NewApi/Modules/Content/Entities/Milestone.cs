using API.Common.Domain;
using API.Common.Localization;

namespace API.Modules.Content.Entities;

public class Milestone : BaseEntity
{
    public int Year { get; set; }
    public TranslatedText Title { get; set; } = new();
    public TranslatedText Description { get; set; } = new();
    public int SortOrder { get; set; }
}
