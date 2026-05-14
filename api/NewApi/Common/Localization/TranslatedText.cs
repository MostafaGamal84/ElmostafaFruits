namespace API.Common.Localization;

public class TranslatedText : Dictionary<string, string>
{
    public TranslatedText() : base(StringComparer.OrdinalIgnoreCase) { }

    public TranslatedText(IDictionary<string, string> values)
        : base(values, StringComparer.OrdinalIgnoreCase) { }

    public string Get(string locale, string fallback = "en")
    {
        if (TryGetValue(locale, out var value) && !string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        if (TryGetValue(fallback, out var fallbackValue) && !string.IsNullOrWhiteSpace(fallbackValue))
        {
            return fallbackValue;
        }

        return Values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v)) ?? string.Empty;
    }
}
