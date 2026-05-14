namespace API.Modules.Portfolio;

public static class PortfolioConstants
{
    public static readonly string[] ProductCategories = ["tropical", "stone", "citrus", "exotic"];
    public static readonly string[] ContentStatuses = ["Draft", "Live", "Active", "Seasonal", "Review"];
    public static readonly string[] MessageStatuses = ["New", "Read"];
    public static readonly string[] OverrideTypes = ["text", "textarea", "html", "image"];
    public static readonly string[] OverrideScopes = ["en", "ar", "global"];

    public static bool IsValidProductCategory(string value) =>
        ProductCategories.Contains(value, StringComparer.OrdinalIgnoreCase);

    public static bool IsValidContentStatus(string value) =>
        ContentStatuses.Contains(value, StringComparer.OrdinalIgnoreCase);

    public static bool IsValidMessageStatus(string value) =>
        MessageStatuses.Contains(value, StringComparer.OrdinalIgnoreCase);

    public static bool IsValidOverrideType(string value) =>
        OverrideTypes.Contains(value, StringComparer.OrdinalIgnoreCase);

    public static bool IsValidOverrideScope(string value) =>
        OverrideScopes.Contains(value, StringComparer.OrdinalIgnoreCase);

    public static string NormalizeProductCategory(string value) =>
        ProductCategories.First(x => x.Equals(value, StringComparison.OrdinalIgnoreCase));

    public static string NormalizeContentStatus(string value) =>
        ContentStatuses.First(x => x.Equals(value, StringComparison.OrdinalIgnoreCase));

    public static string NormalizeMessageStatus(string value) =>
        MessageStatuses.First(x => x.Equals(value, StringComparison.OrdinalIgnoreCase));

    public static string NormalizeOverrideType(string value) =>
        OverrideTypes.First(x => x.Equals(value, StringComparison.OrdinalIgnoreCase));

    public static string NormalizeOverrideScope(string value) =>
        OverrideScopes.First(x => x.Equals(value, StringComparison.OrdinalIgnoreCase));
}
