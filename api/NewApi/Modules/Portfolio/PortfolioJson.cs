using System.Text.Json;

namespace API.Modules.Portfolio;

public static class PortfolioJson
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    public static string SerializeStringList(IEnumerable<string>? values)
    {
        var normalized = values?
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList() ?? [];

        return JsonSerializer.Serialize(normalized, Options);
    }

    public static List<string> DeserializeStringList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];

        try
        {
            return JsonSerializer.Deserialize<List<string>>(json, Options) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    public static JsonElement ParseElement(string json)
    {
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.Clone();
    }

    public static string SerializeElement(JsonElement element) =>
        JsonSerializer.Serialize(element, Options);

    public static string? TrimToNull(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }
}
