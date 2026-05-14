using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace API.Common.Web;

public static class SlugHelper
{
    public static string Slugify(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        var normalized = input.Trim().Normalize(NormalizationForm.FormKD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(c);
            if (category != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }
        var clean = sb.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
        clean = Regex.Replace(clean, @"[^a-z0-9\u0600-\u06FF\s-]", string.Empty);
        clean = Regex.Replace(clean, @"\s+", "-").Trim('-');
        return clean;
    }
}
