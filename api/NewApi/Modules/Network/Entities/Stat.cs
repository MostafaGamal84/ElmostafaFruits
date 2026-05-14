using API.Common.Domain;
using API.Common.Localization;

namespace API.Modules.Network.Entities;

public class Stat : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public TranslatedText Label { get; set; } = new();
    public string Value { get; set; } = string.Empty;
    public string? Unit { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
}
