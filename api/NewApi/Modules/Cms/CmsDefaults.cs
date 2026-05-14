using System.Text.Json;

namespace API.Modules.Cms;

public static class CmsDefaults
{
    private const string DefaultSiteContentJson = """
    {
      "navbar": {
        "about": { "en": "About", "ar": "عنّا" },
        "products": { "en": "Products", "ar": "منتجاتنا" },
        "origins": { "en": "Origins", "ar": "المصادر" },
        "catalog": { "en": "Catalog", "ar": "الكتالوج" },
        "blog": { "en": "Blog", "ar": "المدونة" },
        "quote": { "en": "Request Quote", "ar": "اطلب عرض سعر" },
        "contact": { "en": "Contact", "ar": "تواصل معنا" },
        "adminLink": { "en": "Admin Login", "ar": "دخول الأدمن" }
      },
      "hero": {
        "eyebrow": { "en": "PREMIUM FRUIT IMPORTERS", "ar": "مستوردو كبار الفواكه الفاخرة" },
        "title": { "en": "EL MOSTAFA", "ar": "المصطفى" },
        "subtitle": {
          "en": "Cairo's leading importer of premium tropical and exotic fruits. Sourced globally, delivered fresh.",
          "ar": "المستورد الرائد للفواكه الاستوائية والغريبة الفاخرة في القاهرة. مستوردة عالميًا، ومسلّمة طازجة."
        },
        "cta": { "en": "EXPLORE PRODUCTS", "ar": "استكشف منتجاتنا" }
      },
      "footer": {
        "brandText": {
          "en": "EL MOSTAFA",
          "ar": "\u0627\u0644\u0645\u0635\u0637\u0641\u0649"
        },
        "description": {
          "en": "Premium quality fruit importers serving Cairo with the finest selection from around the globe since 2010.",
          "ar": "مستوردو فواكه بجودة عالية نخدم القاهرة بأفضل الاختيارات من جميع أنحاء العالم منذ عام 2010."
        },
        "address": { "en": "Cairo, Egypt", "ar": "القاهرة، مصر" },
        "email": "contact@elmostafafruits.com",
        "phone": "+20 100 000 0000"
      }
    }
    """;

    public static readonly HashSet<string> SiteContentNodeIds =
    [
        "navbar.about",
        "navbar.products",
        "navbar.origins",
        "navbar.catalog",
        "navbar.blog",
        "navbar.quote",
        "navbar.contact",
        "navbar.adminLink",
        "hero.eyebrow",
        "hero.title",
        "hero.subtitle",
        "hero.cta",
        "footer.brandText",
        "footer.description",
        "footer.address",
        "footer.email",
        "footer.phone"
    ];

    public static readonly Dictionary<string, string> DefaultSettings = new(StringComparer.OrdinalIgnoreCase)
    {
        ["brand.logo"] = "assets/logo.png"
    };

    public static JsonElement GetDefaultSiteContent()
    {
        using var document = JsonDocument.Parse(DefaultSiteContentJson);
        return document.RootElement.Clone();
    }
}
