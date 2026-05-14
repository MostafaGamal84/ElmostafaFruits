namespace API.Common.Localization;

public static class RequestLocale
{
    public static readonly string[] Supported = { "ar", "en", "es", "fr" };
    public const string Default = "en";

    public static string Resolve(HttpRequest request)
    {
        var fromQuery = request.Query["locale"].ToString();
        if (!string.IsNullOrWhiteSpace(fromQuery) && Supported.Contains(fromQuery, StringComparer.OrdinalIgnoreCase))
        {
            return fromQuery.ToLowerInvariant();
        }

        var accept = request.Headers.AcceptLanguage.ToString();
        if (!string.IsNullOrWhiteSpace(accept))
        {
            foreach (var part in accept.Split(','))
            {
                var lang = part.Split(';')[0].Trim().Split('-')[0].ToLowerInvariant();
                if (Supported.Contains(lang, StringComparer.OrdinalIgnoreCase))
                {
                    return lang;
                }
            }
        }

        return Default;
    }
}
