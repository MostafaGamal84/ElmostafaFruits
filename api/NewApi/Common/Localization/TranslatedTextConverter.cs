using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Common.Localization;

public class TranslatedTextConverter : ValueConverter<TranslatedText, string>
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public TranslatedTextConverter()
        : base(
            v => Serialize(v),
            v => Deserialize(v))
    { }

    private static string Serialize(TranslatedText value)
    {
        return value is null ? "{}" : JsonSerializer.Serialize((Dictionary<string, string>)value, Options);
    }

    private static TranslatedText Deserialize(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return new TranslatedText();
        }

        var dict = JsonSerializer.Deserialize<Dictionary<string, string>>(value, Options) ?? new();
        return new TranslatedText(dict);
    }
}

public class TranslatedTextComparer : ValueComparer<TranslatedText>
{
    public TranslatedTextComparer()
        : base(
            (a, b) => Equal(a, b),
            v => v == null ? 0 : v.Aggregate(0, (h, kv) => HashCode.Combine(h, kv.Key, kv.Value)),
            v => v == null ? new TranslatedText() : new TranslatedText(v))
    { }

    private static bool Equal(TranslatedText? a, TranslatedText? b)
    {
        if (ReferenceEquals(a, b)) return true;
        if (a is null || b is null) return false;
        if (a.Count != b.Count) return false;
        foreach (var kv in a)
        {
            if (!b.TryGetValue(kv.Key, out var v) || !string.Equals(v, kv.Value)) return false;
        }
        return true;
    }
}
