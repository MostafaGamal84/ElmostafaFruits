using API.Common.Localization;
using API.Common.Web;
using API.Entities;
using API.Modules.Catalog.Entities;
using API.Modules.Cms;
using API.Modules.Cms.Entities;
using API.Modules.Content.Entities;
using API.Modules.Network.Entities;
using API.Modules.Portfolio;
using API.Modules.Portfolio.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public static class Seed
{
    public static async Task SeedRoles(RoleManager<AppRole> roleManager)
    {
        var roles = new[] { "Admin", "Editor" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new AppRole { Name = role });
            }
        }
    }

    public static async Task SeedDefaultUsers(UserManager<AppUser> userManager)
    {
        const string adminEmail = "admin@example.com";
        var admin = await userManager.FindByEmailAsync(adminEmail);

        if (admin is null)
        {
            admin = new AppUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "User",
                RegisterTime = DateTime.UtcNow,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(admin, "Admin@12345");
            if (!createResult.Succeeded) return;
        }
        else if (admin.IsDeleted)
        {
            admin.IsDeleted = false;
            admin.EmailConfirmed = true;
            await userManager.UpdateAsync(admin);
        }

        if (!await userManager.IsInRoleAsync(admin, "Admin"))
        {
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }

    public static async Task EnsureUsersHaveRoles(UserManager<AppUser> userManager)
    {
        var users = await userManager.Users
            .Where(x => !x.IsDeleted)
            .ToListAsync();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            if (roles.Count == 0)
            {
                await userManager.AddToRoleAsync(user, "Editor");
            }
        }
    }

    public static async Task SeedPortfolioData(DataContext context)
    {
        var now = DateTimeOffset.UtcNow;

        if (!await context.SiteSettings.AnyAsync())
        {
            context.SiteSettings.AddRange(CmsDefaults.DefaultSettings.Select(setting => new SiteSetting
            {
                Key = setting.Key,
                Type = "image",
                DraftValue = setting.Value,
                PublishedValue = setting.Value,
                UpdatedAt = now,
                PublishedAt = now
            }));
        }

        if (!await context.SiteContents.AnyAsync())
        {
            context.SiteContents.Add(new SiteContent
            {
                Id = 1,
                Configuration = DefaultSiteContentJson,
                UpdatedAt = now
            });
        }

        if (!await context.Origins.AnyAsync())
        {
            context.Origins.AddRange(
                new Origin
                {
                    Id = "IT",
                    Flag = "IT",
                    Country = "Italy",
                    CountryAr = "إيطاليا",
                    Focus = "Apples, plums, peaches, and cherries",
                    FeaturedItems = 5,
                    Latitude = 41.8719,
                    Longitude = 12.5674,
                    Status = "Active",
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new Origin
                {
                    Id = "EG",
                    Flag = "EG",
                    Country = "Egypt",
                    CountryAr = "مصر",
                    Focus = "Local distribution and premium market operations",
                    FeaturedItems = 2,
                    Latitude = 26.8206,
                    Longitude = 30.8025,
                    Status = "Active",
                    CreatedAt = now,
                    UpdatedAt = now
                });
        }

        if (!await context.ShowcaseProducts.AnyAsync())
        {
            context.ShowcaseProducts.AddRange(
                new ShowcaseProduct
                {
                    Name = "Premium Apples",
                    NameAr = "تفاح فاخر",
                    Category = PortfolioConstants.NormalizeProductCategory("stone"),
                    OriginJson = PortfolioJson.SerializeStringList(["Italy", "Poland", "Greece"]),
                    VarietiesJson = PortfolioJson.SerializeStringList(["Gala", "Golden"]),
                    ImageUrl = "assets/real-apple.png",
                    Status = PortfolioConstants.NormalizeContentStatus("Live"),
                    Note = "Featured in the public showcase grid.",
                    Description = "Premium sweet apples",
                    DescriptionAr = "تفاح سكري فاخر",
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new ShowcaseProduct
                {
                    Name = "Gold Pineapples",
                    NameAr = "أناناس ذهبي",
                    Category = PortfolioConstants.NormalizeProductCategory("exotic"),
                    OriginJson = PortfolioJson.SerializeStringList(["Costa Rica", "Malaysia"]),
                    VarietiesJson = PortfolioJson.SerializeStringList(["MD2"]),
                    ImageUrl = "assets/real-pineapple.png",
                    Status = PortfolioConstants.NormalizeContentStatus("Live"),
                    Note = "High-rotation premium tropical fruit.",
                    Description = "Honey-sweet tropical pineapples",
                    DescriptionAr = "أناناس استوائي حلو",
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new ShowcaseProduct
                {
                    Name = "Premium Oranges",
                    NameAr = "برتقال ممتاز",
                    Category = PortfolioConstants.NormalizeProductCategory("citrus"),
                    OriginJson = PortfolioJson.SerializeStringList(["Egypt", "Spain"]),
                    VarietiesJson = PortfolioJson.SerializeStringList(["Navel", "Valencia"]),
                    ImageUrl = "assets/real-orange.png",
                    Status = PortfolioConstants.NormalizeContentStatus("Live"),
                    Note = "Citrus line used across the hero visuals and catalog.",
                    Description = "Fresh citrus line for retail and wholesale supply",
                    DescriptionAr = "خط موالح طازج للتجزئة والجملة",
                    CreatedAt = now,
                    UpdatedAt = now
                });
        }

        await context.SaveChangesAsync();
        await SeedCatalogAsync(context);
        await SeedNetworkAsync(context);
        await SeedContentModulesAsync(context);
    }

    private static async Task SeedCatalogAsync(DataContext context)
    {
        if (!await context.Categories.AnyAsync())
        {
            context.Categories.AddRange(
                new Category
                {
                    Slug = "stone-fruits",
                    Name = T("Stone Fruits", "الفاكهة ذات النواة"),
                    Description = T(
                        "Peaches, plums, cherries, and premium orchard selections for seasonal programs.",
                        "خوخ وبرقوق وكرز واختيارات بستانية مميزة للبرامج الموسمية."
                    ),
                    Icon = "layers",
                    SortOrder = 1
                },
                new Category
                {
                    Slug = "exotic-fruits",
                    Name = T("Exotic Fruits", "الفواكه الغريبة"),
                    Description = T(
                        "Bold premium imports such as avocado, kiwi, and other high-value exotic lines.",
                        "واردات فاخرة مثل الأفوكادو والكيوي وغيرها من الأصناف ذات القيمة العالية."
                    ),
                    Icon = "sparkles",
                    SortOrder = 2
                },
                new Category
                {
                    Slug = "tropical-fruits",
                    Name = T("Tropical Fruits", "الفواكه الاستوائية"),
                    Description = T(
                        "Sweet, high-aroma tropical products sourced for retail, hotel, and wholesale channels.",
                        "منتجات استوائية عطرية وحلوة مخصصة للتجزئة والفنادق والجملة."
                    ),
                    Icon = "sun",
                    SortOrder = 3
                },
                new Category
                {
                    Slug = "citrus-fruits",
                    Name = T("Citrus Fruits", "الموالح"),
                    Description = T(
                        "Reliable citrus lines built for both domestic programs and export-ready supply.",
                        "خطوط موالح مستقرة للبرامج المحلية والتوريد الجاهز للتصدير."
                    ),
                    Icon = "droplets",
                    SortOrder = 4
                });

            await context.SaveChangesAsync();
        }

        if (!await context.Products.AnyAsync())
        {
            var categories = await context.Categories
                .AsNoTracking()
                .ToDictionaryAsync(x => x.Slug, x => x.Id);

            context.Products.AddRange(
                CreateProduct(
                    categories["stone-fruits"],
                    "Premium Apples",
                    "تفاح فاخر",
                    "Crisp premium apples from top European orchards.",
                    "تفاح مقرمش فاخر من أفضل بساتين أوروبا.",
                    "A premium line of Gala, Golden, and red apple programs designed for retailers, premium grocers, and high-turn wholesale orders.",
                    "خط ممتاز من أصناف الجالا والجولدن والتفاح الأحمر مخصص للتجزئة والجملة السريعة.",
                    "Italy, Poland, Greece",
                    "إيطاليا، بولندا، اليونان",
                    "Late summer to winter",
                    "من أواخر الصيف إلى الشتاء",
                    "65+, 70+, 75+, 80+",
                    "65+، 70+، 75+، 80+",
                    "Cartons, trays, and retail-ready packs.",
                    "كراتين وصواني وعبوات جاهزة للبيع.",
                    true,
                    1
                ),
                CreateProduct(
                    categories["exotic-fruits"],
                    "Fresh Kiwi",
                    "كيوي طازج",
                    "Bright kiwi with balanced sweetness and acidity.",
                    "كيوي نابض بحلاوة وحموضة متوازنة.",
                    "Hand-picked kiwi programs with uniform color, clean texture, and reliable shelf life for premium fruit counters.",
                    "برامج كيوي منتقاة يدويًا بلون موحد وقوام نظيف وعمر عرض مناسب لواجهات الفواكه الفاخرة.",
                    "Greece, Italy",
                    "اليونان، إيطاليا",
                    "Autumn to spring",
                    "من الخريف إلى الربيع",
                    "27, 30, 33, 36",
                    "27 و30 و33 و36",
                    "Single-layer trays and export cartons.",
                    "صواني طبقة واحدة وكراتين تصدير.",
                    true,
                    2
                ),
                CreateProduct(
                    categories["exotic-fruits"],
                    "Hass Avocado",
                    "أفوكادو هاس",
                    "Creamy Hass avocados with premium ripening behavior.",
                    "أفوكادو هاس كريمي بجودة نضج ممتازة.",
                    "Sourced from trusted farms to deliver consistent oil content, creamy texture, and attractive dark skin at retail maturity.",
                    "يتم توريده من مزارع موثوقة لضمان نسبة زيت جيدة وقوام كريمي ولون قشرة مناسب للبيع.",
                    "Kenya",
                    "كينيا",
                    "Year-round windows",
                    "مواسم متاحة على مدار العام",
                    "12, 14, 16, 18, 20",
                    "12 و14 و16 و18 و20",
                    "4 kg export cartons and food-service packs.",
                    "كراتين تصدير 4 كجم وعبوات لخدمة الطعام.",
                    true,
                    3
                ),
                CreateProduct(
                    categories["stone-fruits"],
                    "Sweet Cherries",
                    "كرز حلو",
                    "Seasonal cherries with intense color and sweetness.",
                    "كرز موسمي بلون قوي وحلاوة عالية.",
                    "Dark glossy cherry selections aimed at seasonal premium windows for gifting, hospitality, and top-end grocery programs.",
                    "اختيارات كرز داكن لامع موجهة للمواسم الفاخرة والهدايا والفنادق ومتاجر البقالة الراقية.",
                    "Greece, Italy",
                    "اليونان، إيطاليا",
                    "Late spring to summer",
                    "من أواخر الربيع إلى الصيف",
                    "26+, 28+, 30+",
                    "26+ و28+ و30+",
                    "Premium punnets and display cartons.",
                    "عبوات فاخرة صغيرة وكراتين عرض.",
                    false,
                    4
                ),
                CreateProduct(
                    categories["tropical-fruits"],
                    "Gold Pineapples",
                    "أناناس ذهبي",
                    "Golden MD2 pineapples with honey-like sweetness.",
                    "أناناس MD2 ذهبي بطعم يشبه العسل.",
                    "A tropical signature line offering strong aroma, stable sugar levels, and a clean internal finish for premium programs.",
                    "خط استوائي مميز يقدم رائحة قوية ونسبة سكر مستقرة ولبًا نظيفًا للبرامج الفاخرة.",
                    "Costa Rica, Malaysia",
                    "كوستاريكا، ماليزيا",
                    "Year-round",
                    "على مدار العام",
                    "5, 6, 7, 8",
                    "5 و6 و7 و8",
                    "12 kg export cartons and custom retail packs.",
                    "كراتين تصدير 12 كجم وعبوات مخصصة للتجزئة.",
                    true,
                    5
                ),
                CreateProduct(
                    categories["tropical-fruits"],
                    "Premium Bananas",
                    "موز فاخر",
                    "Naturally sweet bananas for daily retail supply.",
                    "موز طبيعي حلو للتوريد اليومي للتجزئة.",
                    "Reliable banana programs selected for uniform ripeness, consistent color, and strong rotation in fast-moving retail channels.",
                    "برامج موز مستقرة مختارة لتوحيد النضج واللون وسرعة الدوران في قنوات البيع السريعة.",
                    "Ecuador",
                    "الإكوادور",
                    "Year-round",
                    "على مدار العام",
                    "Cluster and finger sorted",
                    "مفروز بالعناقيد والأصابع",
                    "Food-service boxes and retail sleeves.",
                    "صناديق لخدمة الطعام وعبوات تجزئة.",
                    false,
                    6
                ),
                CreateProduct(
                    categories["stone-fruits"],
                    "Italian Plums",
                    "برقوق إيطالي",
                    "Juicy plums with velvety texture and deep color.",
                    "برقوق عصاري بقوام مخملي ولون داكن.",
                    "Premium plum supply designed for late-summer programs where texture, shine, and balanced sugar levels matter most.",
                    "توريد برقوق ممتاز مصمم لبرامج أواخر الصيف حيث يهم القوام واللمعان وتوازن السكر.",
                    "Italy",
                    "إيطاليا",
                    "Summer to early autumn",
                    "من الصيف إلى أوائل الخريف",
                    "40+, 45+, 50+",
                    "40+ و45+ و50+",
                    "Tray-packed and flow-wrap options.",
                    "خيارات صواني وعبوات مغلفة.",
                    false,
                    7
                ),
                CreateProduct(
                    categories["stone-fruits"],
                    "Sun-Kissed Peaches",
                    "خوخ مشمس",
                    "Fragrant peaches with soft flesh and balanced sweetness.",
                    "خوخ عطري بقوام طري وحلاوة متوازنة.",
                    "Selected peach programs sourced for fragrance, uniform blush, and consumer-ready eating quality in premium displays.",
                    "برامج خوخ مختارة للرائحة واللون الموحد وجودة الأكل المناسبة لواجهات العرض الفاخرة.",
                    "Italy",
                    "إيطاليا",
                    "Summer",
                    "الصيف",
                    "A, AA, AAA",
                    "A وAA وAAA",
                    "Single-layer trays and branded cartons.",
                    "صواني طبقة واحدة وكراتين بعلامة تجارية.",
                    false,
                    8
                ),
                CreateProduct(
                    categories["citrus-fruits"],
                    "Premium Oranges",
                    "برتقال ممتاز",
                    "Juicy citrus line with bright skin and fresh aroma.",
                    "خط موالح عصاري بلون زاهٍ ورائحة منعشة.",
                    "High-volume orange programs suitable for wholesale, retail promotions, and customers who need steady citrus quality across the season.",
                    "برامج برتقال عالية الحجم مناسبة للجملة والعروض الترويجية والعملاء الذين يحتاجون جودة ثابتة طوال الموسم.",
                    "Egypt, Spain",
                    "مصر، إسبانيا",
                    "Winter to spring",
                    "من الشتاء إلى الربيع",
                    "48, 56, 64, 72, 80",
                    "48 و56 و64 و72 و80",
                    "Open-top cartons, telescopic cartons, and retail nets.",
                    "كراتين مفتوحة وكراتين تلسكوبية وشبك تجزئة.",
                    true,
                    9
                ));

            await context.SaveChangesAsync();
        }

        if (!await context.ProductImages.AnyAsync())
        {
            var products = await context.Products
                .AsNoTracking()
                .ToDictionaryAsync(x => x.Slug, x => x.Id);

            context.ProductImages.AddRange(
                CreateProductImage(products["premium-apples"], "assets/real-apple.png", "Premium Apples", "تفاح فاخر", 1),
                CreateProductImage(products["fresh-kiwi"], "assets/real-kiwi.png", "Fresh Kiwi", "كيوي طازج", 2),
                CreateProductImage(products["hass-avocado"], "assets/real-avocado.png", "Hass Avocado", "أفوكادو هاس", 3),
                CreateProductImage(products["sweet-cherries"], "assets/real-cherry.png", "Sweet Cherries", "كرز حلو", 4),
                CreateProductImage(products["gold-pineapples"], "assets/real-pineapple.png", "Gold Pineapples", "أناناس ذهبي", 5),
                CreateProductImage(products["premium-bananas"], "assets/real-banana.png", "Premium Bananas", "موز فاخر", 6),
                CreateProductImage(products["italian-plums"], "assets/real-plum.png", "Italian Plums", "برقوق إيطالي", 7),
                CreateProductImage(products["sun-kissed-peaches"], "assets/real-peach.png", "Sun-Kissed Peaches", "خوخ مشمس", 8),
                CreateProductImage(products["premium-oranges"], "assets/real-orange.png", "Premium Oranges", "برتقال ممتاز", 9));

            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedNetworkAsync(DataContext context)
    {
        if (!await context.Regions.AnyAsync())
        {
            context.Regions.AddRange(
                CreateRegion("Italy", "إيطاليا", "European orchard programs for apples, cherries, peaches, and plums.", "برامج بساتين أوروبية للتفاح والكرز والخوخ والبرقوق.", "assets/real-apple.png", 1, 41.8719, 12.5674),
                CreateRegion("Poland", "بولندا", "Strong apple sourcing depth for structured seasonal supply.", "عمق قوي في توريد التفاح لبرامج الموسم المنظمة.", "assets/real-apple.png", 2, 51.9194, 19.1451),
                CreateRegion("Greece", "اليونان", "Mediterranean kiwi and cherry windows with premium finish.", "نوافذ كيوي وكرز متوسطية بجودة فاخرة.", "assets/real-kiwi.png", 3, 39.0742, 21.8243),
                CreateRegion("Kenya", "كينيا", "Reliable avocado supply with strong oil content and color.", "توريد أفوكادو موثوق بنسبة زيت جيدة ولون مميز.", "assets/real-avocado.png", 4, -0.0236, 37.9062),
                CreateRegion("Costa Rica", "كوستاريكا", "Tropical pineapple programs for premium retail channels.", "برامج أناناس استوائية لقنوات التجزئة الفاخرة.", "assets/real-pineapple.png", 5, 9.7489, -83.7534),
                CreateRegion("Malaysia", "ماليزيا", "Supplemental tropical sourcing and specialty fruit access.", "توريد استوائي إضافي ووصول إلى أصناف خاصة.", "assets/real-pineapple.png", 6, 4.2105, 101.9758),
                CreateRegion("Ecuador", "الإكوادور", "High-volume banana programs for daily fresh supply.", "برامج موز عالية الحجم للتوريد الطازج اليومي.", "assets/real-banana.png", 7, -1.8312, -78.1834),
                CreateRegion("Egypt", "مصر", "Domestic operations, citrus programs, and customer fulfillment.", "عمليات محلية وبرامج موالح وتنفيذ طلبات العملاء.", "assets/real-orange.png", 8, 26.8206, 30.8025));

            await context.SaveChangesAsync();
        }

        if (!await context.Stats.AnyAsync())
        {
            context.Stats.AddRange(
                new Stat
                {
                    Key = "network.regions",
                    Label = T("Sourcing Regions", "مناطق التوريد"),
                    Value = "8",
                    Unit = null,
                    Icon = "map",
                    SortOrder = 1
                },
                new Stat
                {
                    Key = "network.products",
                    Label = T("Premium Fruit Lines", "خطوط الفاكهة الفاخرة"),
                    Value = "9",
                    Unit = null,
                    Icon = "box",
                    SortOrder = 2
                },
                new Stat
                {
                    Key = "network.experience",
                    Label = T("Years In Market", "سنوات في السوق"),
                    Value = "15",
                    Unit = "+",
                    Icon = "calendar",
                    SortOrder = 3
                },
                new Stat
                {
                    Key = "network.response",
                    Label = T("Lead Response", "سرعة الرد"),
                    Value = "24",
                    Unit = "h",
                    Icon = "clock",
                    SortOrder = 4
                });

            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedContentModulesAsync(DataContext context)
    {
        if (!await context.Milestones.AnyAsync())
        {
            context.Milestones.AddRange(
                new Milestone
                {
                    Year = 2010,
                    Title = T("Brand Launch", "انطلاق العلامة"),
                    Description = T(
                        "EL MOSTAFA began building a premium fruit sourcing network focused on quality-driven partnerships.",
                        "بدأت EL MOSTAFA بناء شبكة توريد فواكه فاخرة تركّز على الشراكات القائمة على الجودة."
                    ),
                    SortOrder = 1
                },
                new Milestone
                {
                    Year = 2016,
                    Title = T("Expanded Imports", "توسّع الاستيراد"),
                    Description = T(
                        "The business expanded into wider exotic and tropical fruit lines for retail and hospitality clients.",
                        "توسعت الأعمال إلى خطوط أوسع من الفواكه الغريبة والاستوائية لعملاء التجزئة والضيافة."
                    ),
                    SortOrder = 2
                },
                new Milestone
                {
                    Year = 2023,
                    Title = T("Integrated Portfolio Platform", "منصة بورتفوليو متكاملة"),
                    Description = T(
                        "Content, catalog, sourcing regions, and inbound leads were unified into one manageable digital experience.",
                        "تم توحيد المحتوى والكتالوج ومناطق التوريد والطلبات الواردة في تجربة رقمية واحدة قابلة للإدارة."
                    ),
                    SortOrder = 3
                });

            await context.SaveChangesAsync();
        }

        if (!await context.ArticleCategories.AnyAsync())
        {
            context.ArticleCategories.AddRange(
                new ArticleCategory
                {
                    Slug = "sourcing-insights",
                    Name = T("Sourcing Insights", "رؤى التوريد")
                },
                new ArticleCategory
                {
                    Slug = "quality-control",
                    Name = T("Quality Control", "ضبط الجودة")
                },
                new ArticleCategory
                {
                    Slug = "market-updates",
                    Name = T("Market Updates", "تحديثات السوق")
                });

            await context.SaveChangesAsync();
        }

        if (!await context.Articles.AnyAsync())
        {
            var categories = await context.ArticleCategories
                .AsNoTracking()
                .ToDictionaryAsync(x => x.Slug, x => x.Id);

            context.Articles.AddRange(
                new Article
                {
                    Slug = "how-we-build-seasonal-sourcing-programs",
                    Title = T("How We Build Seasonal Sourcing Programs", "كيف نبني برامج توريد موسمية"),
                    Excerpt = T(
                        "A look at how regional crop calendars shape the premium fruit portfolio year-round.",
                        "نظرة على كيفية تشكيل روزنامة المحاصيل الإقليمية لمحفظة الفواكه الفاخرة على مدار العام."
                    ),
                    Body = T(
                        "<p>We build sourcing programs around crop timing, product finish, and commercial reliability. Each season starts with origin mapping, then moves into caliber planning, packing requirements, and retail timing.</p><p>This approach helps us move from spot buying into repeatable premium supply for customers who care about consistency.</p>",
                        "<p>نحن نبني برامج التوريد على توقيت المحصول وجودة المنتج والاعتمادية التجارية. يبدأ كل موسم بخريطة للمناشئ ثم ينتقل إلى تخطيط المقاسات ومتطلبات التعبئة وتوقيت البيع.</p><p>هذا النهج يساعدنا على التحول من الشراء الفوري إلى توريد فاخر متكرر للعملاء الذين يهتمون بالثبات.</p>"
                    ),
                    CoverImageUrl = "assets/real-pineapple.png",
                    CategoryId = categories["sourcing-insights"],
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-21)
                },
                new Article
                {
                    Slug = "cold-chain-checkpoints-that-protect-quality",
                    Title = T("Cold-Chain Checkpoints That Protect Quality", "محطات سلسلة التبريد التي تحمي الجودة"),
                    Excerpt = T(
                        "What we monitor between arrival, storage, and dispatch to preserve premium fruit quality.",
                        "ما الذي نراقبه بين الوصول والتخزين والشحن للحفاظ على جودة الفاكهة الفاخرة."
                    ),
                    Body = T(
                        "<p>Quality does not depend on sourcing alone. Temperature discipline, handling speed, and packaging integrity all affect the final consumer experience.</p><p>Our internal checkpoints focus on appearance, pressure, damage control, and readiness for each destination channel.</p>",
                        "<p>الجودة لا تعتمد على التوريد فقط. الانضباط الحراري وسرعة المناولة وسلامة التعبئة كلها تؤثر في تجربة المستهلك النهائية.</p><p>تركز محطاتنا الداخلية على الشكل والصلابة وتقليل التلف والاستعداد لكل قناة توزيع.</p>"
                    ),
                    CoverImageUrl = "assets/real-kiwi.png",
                    CategoryId = categories["quality-control"],
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-14)
                },
                new Article
                {
                    Slug = "what-premium-fruit-buyers-look-for-in-2026",
                    Title = T("What Premium Fruit Buyers Look For In 2026", "ما الذي يبحث عنه مشترو الفاكهة الفاخرة في 2026"),
                    Excerpt = T(
                        "Retail and hospitality demand is shifting toward cleaner presentation, reliable supply, and faster response.",
                        "يتجه طلب التجزئة والضيافة نحو عرض أنظف وتوريد أكثر ثباتًا واستجابة أسرع."
                    ),
                    Body = T(
                        "<p>Across premium programs, buyers increasingly value clean presentation, consistent sizing, and supplier responsiveness as much as raw price.</p><p>The strongest demand remains concentrated around dependable exotic, citrus, and display-driven seasonal fruit lines.</p>",
                        "<p>في البرامج الفاخرة يقدّر المشترون بشكل متزايد جودة العرض وثبات المقاسات واستجابة المورد بقدر ما يهتمون بالسعر الخام.</p><p>يظل الطلب الأقوى متمركزًا حول الأصناف الغريبة والموالح وخطوط الفاكهة الموسمية المناسبة للعرض.</p>"
                    ),
                    CoverImageUrl = "assets/real-orange.png",
                    CategoryId = categories["market-updates"],
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-7)
                });

            await context.SaveChangesAsync();
        }

        if (!await context.StaticPages.AnyAsync())
        {
            context.StaticPages.AddRange(
                new StaticPage
                {
                    Slug = "privacy-policy",
                    Title = T("Privacy Policy", "سياسة الخصوصية"),
                    Body = T(
                        "<p>We collect only the information needed to respond to inquiries, quote requests, newsletter subscriptions, and account operations within the portfolio CMS.</p><p>Contact details are used only for business communication related to your request.</p>",
                        "<p>نحن نجمع فقط المعلومات اللازمة للرد على الاستفسارات وطلبات التسعير والاشتراكات وإدارة الحسابات داخل نظام الموقع.</p><p>تُستخدم بيانات الاتصال فقط للتواصل التجاري المرتبط بطلبك.</p>"
                    )
                },
                new StaticPage
                {
                    Slug = "terms-conditions",
                    Title = T("Terms & Conditions", "الشروط والأحكام"),
                    Body = T(
                        "<p>All catalog content, public copy, and product availability information is provided for commercial introduction and may change with seasonality, sourcing, and supply conditions.</p><p>Final supply terms are confirmed through direct business communication and approved quotations.</p>",
                        "<p>يتم تقديم كل محتوى الكتالوج والنصوص العامة ومعلومات توفر المنتجات للتعريف التجاري وقد تتغير تبعًا للموسمية والتوريد وظروف الإمداد.</p><p>يتم تأكيد الشروط النهائية للتوريد من خلال التواصل التجاري المباشر والعروض المعتمدة.</p>"
                    )
                });

            await context.SaveChangesAsync();
        }
    }

    private static Product CreateProduct(
        int categoryId,
        string nameEn,
        string nameAr,
        string shortEn,
        string shortAr,
        string longEn,
        string longAr,
        string originEn,
        string originAr,
        string seasonEn,
        string seasonAr,
        string calibersEn,
        string calibersAr,
        string packagingEn,
        string packagingAr,
        bool isFeatured,
        int sortOrder)
    {
        return new Product
        {
            CategoryId = categoryId,
            Slug = SlugHelper.Slugify(nameEn),
            Name = T(nameEn, nameAr),
            ShortDescription = T(shortEn, shortAr),
            LongDescription = T(longEn, longAr),
            Origin = T(originEn, originAr),
            Season = T(seasonEn, seasonAr),
            Calibers = T(calibersEn, calibersAr),
            PackagingDetails = T(packagingEn, packagingAr),
            IsFeatured = isFeatured,
            IsActive = true,
            SortOrder = sortOrder
        };
    }

    private static ProductImage CreateProductImage(
        int productId,
        string url,
        string altEn,
        string altAr,
        int sortOrder)
    {
        return new ProductImage
        {
            ProductId = productId,
            Url = url,
            Alt = T(altEn, altAr),
            SortOrder = sortOrder,
            IsCover = true
        };
    }

    private static Region CreateRegion(
        string nameEn,
        string nameAr,
        string descriptionEn,
        string descriptionAr,
        string imageUrl,
        int sortOrder,
        double latitude,
        double longitude)
    {
        return new Region
        {
            Slug = SlugHelper.Slugify(nameEn),
            Name = T(nameEn, nameAr),
            Description = T(descriptionEn, descriptionAr),
            ImageUrl = imageUrl,
            Latitude = latitude,
            Longitude = longitude,
            SortOrder = sortOrder,
            IsActive = true
        };
    }

    private static TranslatedText T(string en, string ar)
    {
        return new TranslatedText
        {
            ["en"] = en,
            ["ar"] = ar
        };
    }

    private const string DefaultSiteContentJson = """
    {
      "navbar": {
        "about": { "en": "About", "ar": "عنّا" },
        "products": { "en": "Products", "ar": "منتجاتنا" },
        "origins": { "en": "Origins", "ar": "المصادر" },
        "contact": { "en": "Contact", "ar": "تواصل معنا" }
      },
      "hero": {
        "eyebrow": { "en": "PREMIUM FRUIT IMPORTERS", "ar": "مستوردو كبار الفواكه الفاخرة" },
        "title": { "en": "EL MOSTAFA", "ar": "المصطفى" },
        "subtitle": {
          "en": "Cairo's leading importer of premium tropical and exotic fruits. Sourced globally, delivered fresh.",
          "ar": "المستورد الرائد للفواكه الاستوائية والغريبة الفاخرة في القاهرة. مستوردة عالميًا، ومسلمة طازجة."
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
        "address": {
          "en": "Cairo, Egypt",
          "ar": "القاهرة، مصر"
        },
        "email": "contact@elmostafafruits.com",
        "phone": "+20 100 000 0000"
      }
    }
    """;
}
