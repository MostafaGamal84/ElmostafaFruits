import { Injectable, signal, computed, inject } from '@angular/core';
import { SiteContentApiService } from './site-content-api.service';
import { SiteContent } from '../models/site-content.model';
import { repairDeepText, repairText } from '../utils/text-normalizer.util';
import { readLocalStorage, writeLocalStorage } from '../utils/browser-storage.util';

export type Language = 'en' | 'ar';
export interface LanguageSetOptions {
  persist?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly LANG_KEY = 'elmostafa_lang';
  private readonly contentApi = inject(SiteContentApiService);

  readonly currentLang = signal<Language>('en');
  readonly remoteContent = signal<SiteContent | null>(null);

  readonly isRtl = computed(() => this.currentLang() === 'ar');

  private translations: Record<Language, any> = {
    en: {
      nav: { about: 'About', products: 'Products', origins: 'Origins', contact: 'Request a Quote' },
      navbar: {
        catalog: 'Catalog',
        blog: 'Blog',
        quote: 'Become a Supplier',
        adminLink: 'Admin Login',
      },
      hero: {
        eyebrow: 'PREMIUM FRUIT IMPORTERS',
        title: 'EL MOSTAFA',
        subtitle:
          "Cairo's leading importer of premium tropical and exotic fruits. Sourced globally, delivered fresh.",
        cta: 'EXPLORE PRODUCTS',
        story: 'OUR STORY',
        journey: 'The Journey',
        scroll: 'Scroll to trace the path of perfection.',
      },
      aboutUs: {
        eyebrow: 'About Us',
        title: 'Who we are',
        lead:
          'El Mostafa is a Cairo-based fruit importer focused on premium tropical and fresh produce, connecting trusted global growers with Egyptian wholesalers, retailers, and hospitality partners.',
        body:
          'We handle sourcing, quality selection, cold-chain coordination, and daily market supply with a simple promise: consistent fruit, clear communication, and dependable delivery.',
        points: ['Premium sourcing', 'Cold-chain handling', 'Cairo market expertise'],
      },
      about: {
        nodes: [
          {
            title: 'The Origin',
            desc: "Sourced from the world's most premium, sun-drenched orchards. We partner directly with dedicated growers to ensure excellence from the root.",
          },
          {
            title: 'The Selection',
            desc: 'Rigorous hand-picking and unrivaled quality control. Every single fruit is meticulously inspected to meet the El Mostafa standard of vibrancy.',
          },
          {
            title: 'The Delivery',
            desc: 'An unbroken cold chain bridging continents directly to Cairo. We guarantee farm-fresh crispness and an unforgettable taste in every bite.',
          },
        ],
      },
      whyUs: {
        eyebrow: 'OUR COMMITMENT',
        title: 'Why El Mostafa',
        subtitle:
          'Excellence in every bite. Quality in every drop. We go beyond simple importation to deliver an unmatched standard of freshness and taste.',
        pillars: [
          {
            title: 'Global Network',
            desc: 'We source directly from premium farms across Italy, Greece, Kenya, and beyond to ensure peak freshness and variety.',
          },
          {
            title: 'Temperature Controlled',
            desc: 'State-of-the-art cold chain logistics guarantee our fruits arrive in Cairo exactly as pristine as nature intended.',
          },
          {
            title: 'Unmatched Quality',
            desc: 'Every single piece is hand-selected and quality-inspected to meet our rigorously high standards before it reaches you.',
          },
        ],
      },
      products: {
        eyebrow: 'EL MOSTAFA COLLECTION',
        title: 'Our Harvest',
        filterEyebrow: 'Filter by origin',
        allOriginsHint: 'Show every available product',
        subtitle: 'Explore our highly curated selection of the finest imported fruits globally.',
        allOrigins: '🌍 All Origins',
      },
      origins: {
        eyebrow: 'OUR NETWORK',
        title: 'Global Origins',
        subtitle:
          "We source only from the world's most renowned agricultural regions, ensuring peak freshness and unparalleled taste from root to table.",
      },
      slice: {
        title: 'The Core of\nExcellence',
        subtitle: "Unveiling nature's finest selections, handpicked for perfection.",
      },
      marquee: ['PREMIUM QUALITY', 'IMPORTED DAILY', '100% FRESH', 'GLOBAL ORIGINS', 'CAIRO BASED'],
      footer: {
        desc: 'Premium quality fruit importers serving Cairo with the finest selection from around the globe since 2010.',
        touch: 'Get in ',
        touchColor: 'Touch',
        addressLabel: 'ADDRESS',
        addressValue: 'Cairo, Egypt',
        emailLabel: 'EMAIL',
        phoneLabel: 'PHONE',
        rights: 'Elmostafa. All rights reserved. Designed and developed by',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
      },
      insights: {
        regionsEyebrow: 'Growing Regions',
        regionsTitle: 'Verified sourcing regions',
        milestonesEyebrow: 'Company Milestones',
        milestonesTitle: 'Export timeline',
      },
      contact: {
        eyebrow: 'Contact',
        title: 'Send a portfolio message',
        nameLabel: 'Full Name',
        namePlaceholder: 'Enter your full name',
        emailLabel: 'Email Address',
        emailPlaceholder: 'email@example.com',
        emailError: 'Please enter a valid email address.',
        typeLabel: 'I am a',
        typeSupplier: 'Supplier',
        typeCustomer: 'Customer',
        subjectLabel: 'Subject',
        subjectPlaceholder: 'What is this about?',
        messageLabel: 'Message',
        messagePlaceholder: 'How can we help you?',
        submitIdle: 'Send Message',
        submitLoading: 'Sending...',
        success: 'Message sent.',
        error: 'Could not send the message.',
      },
      newsletter: {
        eyebrow: 'Newsletter',
        title: 'Stay updated on exports',
        emailLabel: 'Email Address',
        emailPlaceholder: 'email@example.com',
        submitIdle: 'Subscribe',
        submitLoading: 'Subscribing...',
        success: 'Subscription request sent.',
        error: 'Could not subscribe this email.',
      },
      common: { backToTop: 'Back to Top' },
      pages: {
        common: {
          backToPortfolio: 'Back to portfolio',
        },
        catalog: {
          eyebrow: 'Catalog',
          title: 'Product catalog',
          all: 'All',
          viewProduct: 'View product',
          back: 'Back to catalog',
          requestQuote: 'Become a supplier',
          details: {
            origin: 'Origin',
            season: 'Season',
            calibers: 'Calibers',
            packaging: 'Packaging',
          },
        },
        blog: {
          eyebrow: 'Blog',
          title: 'Articles and export notes',
          all: 'All',
          readArticle: 'Read article',
          back: 'Back to blog',
        },
        quote: {
          eyebrow: 'Become a Supplier',
          title: 'Send a supplier application',
          fullName: 'Full name',
          company: 'Company',
          country: 'Country',
          email: 'Email',
          phone: 'Phone',
          quantity: 'Quantity',
          selectProduct: 'Select product',
          message: 'Message',
          submitIdle: 'Submit supplier request',
          submitLoading: 'Sending...',
          success: 'Supplier request sent.',
          error: 'Could not submit the supplier request.',
        },
        newsletterFlow: {
          confirmTitle: 'Newsletter confirmation',
          confirming: 'Confirming your subscription...',
          missingToken: 'Missing confirmation token.',
          confirmed: 'Subscription confirmed.',
          confirmError: 'Could not confirm this subscription.',
          unsubscribeEyebrow: 'Newsletter',
          unsubscribeTitle: 'Unsubscribe',
          unsubscribePlaceholder: 'Email or unsubscribe token',
          unsubscribeSubmit: 'Unsubscribe',
          unsubscribeSubmitting: 'Submitting...',
          unsubscribeSuccess: 'Unsubscribe request completed.',
          unsubscribeError: 'Could not unsubscribe this email/token.',
        },
      },
      admin: {
        title: 'Overview',
        subtitle: 'Simple controls for website content, products, leads, and admin access.',
        sidebar: {
          manage: 'Manage website content, products, customer leads, and team access.',
          viewPortfolio: 'View Portfolio',
          logout: 'Logout',
        },
        brand: {
          cms: 'Portfolio CMS',
        },
        user: {
          fallbackName: 'Admin User',
        },
        theme: {
          switchToLight: 'Switch to Light',
          switchToDark: 'Switch to Dark',
        },
        aria: {
          closeNavigation: 'Close navigation',
          toggleNavigation: 'Toggle navigation',
        },
        common: {
          apply: 'Apply',
          delete: 'Delete',
          edit: 'Edit',
          save: 'Save',
          create: 'Create',
          clear: 'Clear',
          cancel: 'Cancel',
          active: 'Active',
        },
        navGroups: {
          website: 'Website',
          catalogBlog: 'Catalog & Blog',
          leads: 'Leads',
          admin: 'Admin',
        },
        nav: {
          dashboard: 'Overview',
          settings: 'Brand Settings',
          showcase: 'Home Products',
          origins: 'Sourcing Origins',
          siteContent: 'Text Content',
          visualEditor: 'Edit Website',
          catalogProducts: 'Product Catalog',
          categories: 'Catalog Categories',
          articles: 'Blog Articles',
          resources: 'Content Library',
          quotes: 'Quote Requests',
          newsletter: 'Newsletter Subscribers',
          users: 'Team Access',
          messages: 'Contact Messages',
        },
        dashboard: {
          stats: {
            liveShowcaseItems: {
              title: 'Live Home Products',
              description: 'total homepage products',
            },
            newQuotes: {
              title: 'New Quote Requests',
              description: 'pricing requests waiting for review',
            },
            catalogProducts: {
              title: 'Catalog Products',
              description: 'structured products in the catalog',
            },
            managedOrigins: {
              title: 'Managed Origins',
              description: 'Sourcing origins visible inside the public network section',
            },
            managedAreas: {
              title: 'Managed Public Areas',
              description: 'Branding, copy, live editing, showcase, origins, catalog, and blog',
            },
            unreadMessages: {
              title: 'New Messages',
              description: 'contact messages waiting for review',
            },
          },
          primaryActions: {
            title: 'Start Here',
            description: 'The most common admin tasks are grouped in one place.',
            editWebsite: {
              title: 'Edit Website',
              description: 'Open the live preview and update visible text or images directly.',
            },
            aboutUs: {
              title: 'Manage About Us',
              description: 'Update the company overview, logo area copy, and highlight chips.',
            },
            homeProducts: {
              title: 'Manage Home Products',
              description: 'Control the featured products shown on the homepage.',
            },
            catalogProducts: {
              title: 'Manage Product Catalog',
              description:
                'Edit the detailed product catalog used by catalog pages and quote forms.',
            },
            leads: {
              title: 'Review Quote Requests',
              description: 'Follow up with customers asking for prices and supply details.',
            },
          },
          websiteAreas: {
            title: 'Website Areas',
            description: 'A simple map of where each admin section affects the public site.',
            homepage: {
              title: 'Homepage',
              description:
                'Hero, text, home products, sourcing origins, and visible brand content.',
              meta: 'Website',
            },
            aboutUs: {
              title: 'About Us',
              description:
                'Company intro, overview paragraphs, logo image area, and highlight chips.',
              meta: 'Home Section',
            },
            catalog: {
              title: 'Product Catalog',
              description:
                'Structured products, categories, images, product details, and availability.',
              meta: 'Catalog',
            },
            blog: {
              title: 'Blog',
              description: 'Articles and content categories used for export notes and updates.',
              meta: 'Content',
            },
            leads: {
              title: 'Contact & Leads',
              description: 'Quote requests, contact messages, and newsletter subscribers.',
              meta: 'Leads',
            },
          },
          managedAreas: {
            title: 'Managed Public Areas',
            description: 'Direct links to the exact editing flows used by the live site.',
            openLiveEditor: 'Open Live Editor',
          },
          quickActions: {
            title: 'Quick Actions',
            description: 'Shortcuts for the most common portfolio admin tasks.',
          },
          actions: {
            settings: {
              title: 'Logo In Live Editor',
              description: 'Click the navbar logo on the preview to upload a replacement file.',
            },
            showcase: {
              title: 'Showcase Library',
              description: 'Manage the featured collection cards.',
            },
            categories: {
              title: 'Catalog Categories',
              description: 'Create and organize the catalog category list.',
            },
            catalogProducts: {
              title: 'Catalog Products',
              description: 'Control structured product data shown in the catalog.',
            },
            siteContent: {
              title: 'Copy Studio',
              description: 'Edit headlines, labels, and footer content.',
            },
            messages: {
              title: 'Inbox',
              description: 'Track collaboration and contact requests.',
            },
          },
          sections: {
            brandIdentity: {
              title: 'Brand Identity',
              type: 'Media',
              status: 'Live',
              description: 'Navbar logo updates now happen directly from the live editor preview.',
            },
            copyStudio: {
              title: 'Home Copy Studio',
              type: 'Content',
              status: 'Live',
              description:
                'Structured text editing for hero, footer, section headings, and labels.',
            },
            liveEditor: {
              title: 'Live Edit Mode',
              type: 'Live Editing',
              status: 'Live',
              description: 'Direct inline editing on the site preview with image uploads as files.',
            },
            showcase: {
              title: 'Showcase Library',
              type: 'Content',
              status: 'Live',
              description: 'Featured homepage cards shown in the public portfolio showcase.',
            },
            origins: {
              title: 'Origins Network',
              type: 'Content',
              status: 'Live',
              description: 'Country coverage and sourcing highlights visible on the home page.',
            },
            catalogAndBlog: {
              title: 'Catalog And Blog',
              type: 'Content',
              status: 'Live',
              description:
                'Structured products, categories, and articles for the public content areas.',
            },
          },
        },
        pages: {
          users: {
            eyebrow: 'Users',
            title: 'Admin Users',
            createEditor: 'Create editor',
            firstName: 'First name',
            lastName: 'Last name',
            email: 'Email',
            password: 'Password',
            createUser: 'Create user',
            deleteConfirm: 'Delete this user?',
            roles: {
              editor: 'Editor',
              admin: 'Admin',
            },
          },
          newsletter: {
            eyebrow: 'Newsletter',
            title: 'Subscribers',
            exportCsv: 'Export CSV',
            searchEmail: 'Search email',
            anyConfirmation: 'Any confirmation',
            confirmed: 'Confirmed',
            unconfirmed: 'Unconfirmed',
            pending: 'Pending',
            anySubscription: 'Any subscription',
            subscribed: 'Subscribed',
            unsubscribed: 'Unsubscribed',
            active: 'Active',
            deleteConfirm: 'Delete this subscriber?',
          },
          messages: {
            eyebrow: 'Inbox',
            title: 'Portfolio Messages',
            description:
              'Contact and collaboration messages sent from visitors reviewing the portfolio.',
            loading: 'Loading messages...',
            empty: 'No messages found in the inbox.',
            openThread: 'Open Thread',
          },
          resources: {
            eyebrow: 'Resources',
            title: 'Categories, Regions, Milestones, Stats and Pages',
            categoriesEyebrow: 'Categories',
            categoriesTitle: 'Catalog Categories',
            labels: {
              categories: 'Categories',
              regions: 'Regions',
              milestones: 'Milestones',
              stats: 'Stats',
              pages: 'Static Pages',
            },
            fields: {
              slug: 'slug / key',
              nameEn: 'name/title/label EN',
              nameAr: 'name/title/label AR',
              descriptionEn: 'description/body EN',
              descriptionAr: 'description/body AR',
              icon: 'icon',
              value: 'value',
              unit: 'unit',
              latitude: 'latitude',
              longitude: 'longitude',
              year: 'year',
              sortOrder: 'sort order',
            },
            regionImage: 'Region Image',
            uploadingImage: 'Uploading image...',
            changeImage: 'Change image',
            uploadImage: 'Upload image',
            selectedImageHelp: 'Selected image will upload when you save the region.',
            uploadImageHelp: 'Upload a file instead of pasting an image URL.',
            regionPreviewAlt: 'Selected region preview',
            deleteConfirm: 'Delete this item?',
          },
          settings: {
            eyebrow: 'Brand Settings',
            title: 'Control the static brand assets that shape the public experience.',
            description:
              'Upload the live logo as a file, review recent media, and publish the approved brand image to the site without touching code.',
            recentMediaAssets: 'Recent media assets',
            navbarLogo: 'Navbar Logo',
            navbarLogoDescription:
              'Draft and live previews for the main brand mark used across the site.',
            draft: 'Draft',
            live: 'Live',
            draftLogoAlt: 'Draft logo',
            publishedLogoAlt: 'Published logo',
            uploadingLogo: 'Uploading logo...',
            uploadLogoFile: 'Upload logo file',
            publishing: 'Publishing...',
            publishLogoLive: 'Publish Logo Live',
            recentMediaLibrary: 'Recent Media Library',
            recentMediaDescription: 'Quickly reuse recent uploads as the live brand logo.',
            initialNotice:
              'Upload a logo file or pick one from the media library, then publish it.',
            uploadingNotice: 'Uploading the new logo into NewApi media storage...',
            uploadedNotice: 'Uploaded the new logo and saved it to draft.',
            uploadError: 'Could not upload the logo right now.',
            assetAppliedNotice: 'Applied the selected media asset to the draft logo.',
            publishingNotice: 'Publishing the draft logo to the live site...',
            publishedNotice: 'Published the live logo successfully.',
            publishError: 'Could not publish the logo right now.',
            loadError: 'Could not load the latest settings and media right now.',
            saveDraftError: 'The file upload worked, but saving the draft logo failed.',
          },
          origins: {
            eyebrow: 'Origins Management',
            title: 'Public Origins Network',
            description: 'Control the countries and sourcing coverage displayed in the portfolio.',
            addOrigin: 'Add Origin',
            createOrigin: 'Create Origin',
            updateOrigin: 'Update Origin',
            loading: 'Loading origins...',
            empty: 'No origins found in the network.',
            featuredItems: 'Featured items',
            visibilityStatus: 'Visibility status',
            editCoverage: 'Edit Coverage',
            deleteOrigin: 'Delete Origin',
            syncCards: 'Sync Cards',
            deleteConfirm: 'Delete this origin? This action cannot be undone.',
            fields: {
              code: 'Code (e.g. EG)',
              flag: 'Flag',
              countryEn: 'Country EN',
              countryAr: 'Country AR',
              focus: 'Focus',
              featuredItems: 'Featured items',
              status: 'Status',
            },
          },
          products: {
            eyebrow: 'Showcase Management',
            title: 'Portfolio Showcase Library',
            description: 'Manage the fixed collection cards shown in the public portfolio grid.',
            addCard: 'Add Showcase Card',
            loading: 'Loading products...',
            liveCards: 'Live cards',
            draftCards: 'Draft cards',
            totalCards: 'Total managed cards',
            empty: 'No products found in the showcase library.',
            arTitle: 'AR Title',
            notTranslated: 'Not Translated',
            updated: 'Updated',
            editCopy: 'Edit Copy',
            editProduct: 'Edit Product',
            addProduct: 'Add New Product',
            productImage: 'Product Image',
            clickUploadImage: 'Click to upload image',
            changeImage: 'Change Image',
            uploadHint: 'Recommended: Square PNG with transparent background.',
            categoryHint:
              'Showcase categories are fixed visual buckets, separate from the catalog categories.',
            savingChanges: 'Saving Changes...',
            updateProduct: 'Update Product',
            createProduct: 'Create Product',
            deleteConfirm:
              'Are you sure you want to delete this showcase card? This action cannot be undone.',
            fields: {
              nameEn: 'Product Name (EN)',
              nameAr: 'Product Name (AR)',
              category: 'Showcase Category',
              status: 'Status',
              origins: 'Origins (Comma separated)',
              descriptionEn: 'Description (EN)',
              descriptionAr: 'Description (AR)',
              note: 'Admin Note (Private)',
            },
            placeholders: {
              nameEn: 'e.g. Premium Italian Apples',
              nameAr: 'مثال: تفاح إيطالي فاخر',
              origins: 'Italy, Greece, Costa Rica',
              descriptionEn: 'Marketing description for English site...',
              descriptionAr: 'وصف تسويقي للموقع العربي...',
              note: 'Internal notes about this card...',
            },
            status: {
              live: 'Live',
              draft: 'Draft',
              review: 'Review',
            },
            categories: {
              tropical: 'Tropical',
              stone: 'Stone',
              citrus: 'Citrus',
              exotic: 'Exotic',
            },
          },
          articles: {
            eyebrow: 'Articles',
            title: 'Blog Articles and Categories',
            editArticle: 'Edit Article',
            createArticle: 'Create Article',
            coverImage: 'Cover Image',
            selectedCoverHelp: 'Selected cover will upload when you save the article.',
            uploadCoverHelp: 'Upload a file instead of pasting a cover image URL.',
            coverPreviewAlt: 'Selected article cover preview',
            published: 'Published',
            saveArticle: 'Save article',
            categories: 'Categories',
            updateCategory: 'Update category',
            addCategory: 'Add category',
            deleteArticleConfirm: 'Delete this article?',
            deleteCategoryConfirm: 'Delete this article category?',
            fields: {
              slug: 'slug',
              titleEn: 'title EN',
              titleAr: 'title AR',
              category: 'Category',
              excerptEn: 'excerpt EN',
              excerptAr: 'excerpt AR',
              bodyEn: 'body EN',
              bodyAr: 'body AR',
              nameEn: 'name EN',
              nameAr: 'name AR',
            },
          },
          catalogProducts: {
            eyebrow: 'Catalog',
            title: 'Structured Product Catalog',
            manageCategories: 'Manage Categories',
            editProduct: 'Edit Product',
            createProduct: 'Create Product',
            featured: 'Featured',
            saveProduct: 'Save product',
            imagesFor: 'Images for',
            chooseImageFile: 'Choose image file',
            selectedImageHelp: 'Selected image will upload when you add it.',
            imagePreviewAlt: 'Selected catalog image preview',
            cover: 'Cover',
            addImage: 'Add image',
            hidden: 'Hidden',
            deleteProductConfirm: 'Delete this catalog product?',
            deleteImageConfirm: 'Delete this image?',
            fields: {
              originEn: 'origin EN',
              originAr: 'origin AR',
              seasonEn: 'season EN',
              seasonAr: 'season AR',
              calibersEn: 'calibers EN',
              calibersAr: 'calibers AR',
              packagingEn: 'packaging EN',
              packagingAr: 'packaging AR',
              shortEn: 'short description EN',
              shortAr: 'short description AR',
              longEn: 'long description EN',
              longAr: 'long description AR',
              altEn: 'alt EN',
              altAr: 'alt AR',
            },
          },
        },
      },
    },
    ar: {
      nav: { about: 'عنّا', products: 'منتجاتنا', origins: 'المصادر', contact: 'اطلب عرض سعر' },
      navbar: {
        catalog: 'الكتالوج',
        blog: 'المدونة',
        quote: 'كن موردا',
        adminLink: 'دخول الأدمن',
      },
      hero: {
        eyebrow: 'مستوردو كبار الفواكه الفاخرة',
        title: 'المصطفى',
        subtitle:
          'المستورد الرائد للفواكه الاستوائية والغريبة الفاخرة في القاهرة. مستوردة عالمياً، ومسلمة طازجة.',
        cta: 'استكشف منتجاتنا',
        story: 'قصتنا',
        journey: 'الرحلة',
        scroll: 'اسحب للأسفل لتتبع مسار المثالية.',
      },
      aboutUs: {
        eyebrow: 'من نحن',
        title: 'من نحن',
        lead:
          'المصطفى شركة استيراد فواكه مقرها القاهرة، متخصصة في المنتجات الاستوائية والطازجة الفاخرة، وتربط المزارعين العالميين الموثوقين بتجار الجملة والتجزئة وقطاع الضيافة في مصر.',
        body:
          'ندير التوريد واختيار الجودة وتنسيق سلسلة التبريد والإمداد اليومي للسوق بوعد بسيط: فاكهة ثابتة الجودة، تواصل واضح، وتسليم يعتمد عليه.',
        points: ['توريد فاخر', 'إدارة سلسلة التبريد', 'خبرة سوق القاهرة'],
      },
      about: {
        nodes: [
          {
            title: 'الأصـل',
            desc: 'مستورد من أفخم البساتين المشمسة حول العالم. نحن شريك مباشر مع المزارعين لضمان التميز من الجذور.',
          },
          {
            title: 'الاختيار',
            desc: 'عملية قطف صارمة ورقابة لا تضاهى على الجودة. يتم فحص كل فاكهة بدقة لتلبية معايير المصطفى للجمال.',
          },
          {
            title: 'التسـليم',
            desc: 'سلسلة تبريد لم تنقطع تربط القارات مباشرة بالقاهرة. نضمن لك قرمشة المزرعة الطازجة وطعماً لا ينسى.',
          },
        ],
      },
      whyUs: {
        eyebrow: 'التزامنا',
        title: 'لماذا المصطفى؟',
        subtitle:
          'التميز في كل قمة، الجودة في كل قطرة. نحن نتجاوز مجرد الاستيراد لتقديم مستوى لا يضاهى من الطزاجة والطعم.',
        pillars: [
          {
            title: 'شبكة عالمية',
            desc: 'نستورد مباشرة من المزارع الفاخرة في إيطاليا واليونان وكينيا وغيرها لضمان أعلى مستويات الطزاجة والتنوع.',
          },
          {
            title: 'التحكم في الحرارة',
            desc: 'تضمن الخدمات اللوجستية المتطورة لسلسلة التبريد وصول فواكهنا إلى القاهرة تماماً كما أرادتها الطبيعة.',
          },
          {
            title: 'جودة لا تضاهى',
            desc: 'يتم اختيار كل قطعة يدوياً وفحص جودتها لتلبية معاييرنا الصارمة قبل أن تصل إليك.',
          },
        ],
      },
      products: {
        eyebrow: 'مجموعة المصطفى',
        title: 'حصادنا',
        filterEyebrow: 'فلترة حسب المصدر',
        allOriginsHint: 'عرض كل المنتجات المتاحة',
        subtitle: 'استكشف تشكيلتنا المختارة بعناية من أجود الفواكه المستوردة عالمياً.',
        allOrigins: '🌍 جميع المصادر',
      },
      origins: {
        eyebrow: 'شبكتنا',
        title: 'مصادرنا العالمية',
        subtitle:
          'نستورد فقط من أشهر المناطق الزراعية في العالم، لضمان أعلى مستويات الطزاجة والمذاق الفريد.',
      },
      slice: {
        title: 'لب\nالتميز',
        subtitle: 'نكتشف أرقى مختارات الطبيعة، منتقاة بعناية للوصول إلى المثالية.',
      },
      marquee: ['جودة ممتازة', 'مستورد يومياً', 'طازج 100%', 'مصادر عالمية', 'مقرنا القاهرة'],
      footer: {
        desc: 'مستوردو فواكه بجودة عالية نخدم القاهرة بأفضل الاختيارات من جميع أنحاء العالم منذ عام 2010.',
        touch: 'تواصل ',
        touchColor: 'معنا',
        addressLabel: 'العنوان',
        addressValue: 'القاهرة، مصر',
        emailLabel: 'البريد الإلكتروني',
        phoneLabel: 'الهاتف',
        rights: 'المصطفى. جميع الحقوق محفوظة. التصميم والتطوير بواسطة',
        privacy: 'سياسة الخصوصية',
        terms: 'شروط الخدمة',
      },
      insights: {
        regionsEyebrow: 'مناطق النمو',
        regionsTitle: 'مناطق التوريد المعتمدة',
        milestonesEyebrow: 'محطات الشركة',
        milestonesTitle: 'خط التصدير الزمني',
      },
      contact: {
        eyebrow: 'تواصل معنا',
        title: 'أرسل رسالة إلى فريق التوريد',
        nameLabel: 'الاسم الكامل',
        namePlaceholder: 'اكتب اسمك الكامل',
        emailLabel: 'البريد الإلكتروني',
        emailPlaceholder: 'email@example.com',
        emailError: 'يرجى إدخال بريد إلكتروني صحيح.',
        subjectLabel: 'الموضوع',
        subjectPlaceholder: 'بخصوص ماذا؟',
        messageLabel: 'الرسالة',
        messagePlaceholder: 'كيف يمكننا مساعدتك؟',
        submitIdle: 'إرسال الرسالة',
        submitLoading: 'جارٍ الإرسال...',
        success: 'تم إرسال الرسالة.',
        error: 'تعذر إرسال الرسالة.',
      },
      newsletter: {
        eyebrow: 'النشرة البريدية',
        title: 'تابع أحدث تحديثات التصدير',
        emailLabel: 'البريد الإلكتروني',
        emailPlaceholder: 'email@example.com',
        submitIdle: 'اشترك الآن',
        submitLoading: 'جارٍ الاشتراك...',
        success: 'تم إرسال طلب الاشتراك.',
        error: 'تعذر إتمام الاشتراك.',
      },
      common: { backToTop: 'العودة للأعلى' },
      pages: {
        common: {
          backToPortfolio: 'العودة إلى الموقع',
        },
        catalog: {
          eyebrow: 'الكتالوج',
          title: 'كتالوج المنتجات',
          all: 'الكل',
          viewProduct: 'عرض المنتج',
          back: 'العودة إلى الكتالوج',
          requestQuote: 'كن موردا',
          details: {
            origin: 'المنشأ',
            season: 'الموسم',
            calibers: 'الأحجام',
            packaging: 'التعبئة',
          },
        },
        blog: {
          eyebrow: 'المدونة',
          title: 'المقالات وملاحظات التصدير',
          all: 'الكل',
          readArticle: 'قراءة المقال',
          back: 'العودة إلى المدونة',
        },
        quote: {
          eyebrow: 'كن موردا',
          title: 'أرسل طلب الانضمام كمورد',
          fullName: 'الاسم الكامل',
          company: 'الشركة',
          country: 'الدولة',
          email: 'البريد الإلكتروني',
          phone: 'الهاتف',
          quantity: 'الكمية',
          selectProduct: 'اختر المنتج',
          message: 'الرسالة',
          submitIdle: 'إرسال طلب المورد',
          submitLoading: 'جارٍ الإرسال...',
          success: 'تم إرسال طلب المورد.',
          error: 'تعذر إرسال طلب المورد.',
        },
        newsletterFlow: {
          confirmTitle: 'تأكيد النشرة البريدية',
          confirming: 'جارٍ تأكيد اشتراكك...',
          missingToken: 'رمز التأكيد مفقود.',
          confirmed: 'تم تأكيد الاشتراك.',
          confirmError: 'تعذر تأكيد هذا الاشتراك.',
          unsubscribeEyebrow: 'النشرة البريدية',
          unsubscribeTitle: 'إلغاء الاشتراك',
          unsubscribePlaceholder: 'البريد الإلكتروني أو رمز إلغاء الاشتراك',
          unsubscribeSubmit: 'إلغاء الاشتراك',
          unsubscribeSubmitting: 'جارٍ الإرسال...',
          unsubscribeSuccess: 'اكتمل طلب إلغاء الاشتراك.',
          unsubscribeError: 'تعذر إلغاء اشتراك هذا البريد أو الرمز.',
        },
      },
      admin: {
        title: 'نظرة عامة',
        subtitle: 'تحكم مبسط في محتوى الموقع والمنتجات والعملاء وصلاحيات الفريق.',
        sidebar: {
          manage: 'إدارة محتوى الموقع والمنتجات وطلبات العملاء وصلاحيات الفريق.',
          viewPortfolio: 'عرض الموقع',
          logout: 'تسجيل الخروج',
        },
        brand: {
          cms: 'نظام إدارة الموقع',
        },
        user: {
          fallbackName: 'مستخدم الإدارة',
        },
        theme: {
          switchToLight: 'التبديل للوضع الفاتح',
          switchToDark: 'التبديل للوضع الداكن',
        },
        aria: {
          closeNavigation: 'إغلاق القائمة',
          toggleNavigation: 'فتح أو إغلاق القائمة',
        },
        common: {
          apply: 'تطبيق',
          delete: 'حذف',
          edit: 'تعديل',
          save: 'حفظ',
          create: 'إنشاء',
          clear: 'مسح',
          cancel: 'إلغاء',
          active: 'نشط',
        },
        navGroups: {
          website: 'الموقع',
          catalogBlog: 'الكتالوج والمدونة',
          leads: 'العملاء',
          admin: 'الإدارة',
        },
        nav: {
          dashboard: 'نظرة عامة',
          settings: 'إعدادات الهوية',
          showcase: 'منتجات الرئيسية',
          origins: 'مصادر التوريد',
          siteContent: 'النصوص',
          visualEditor: 'تعديل الموقع',
          catalogProducts: 'كتالوج المنتجات',
          categories: 'تصنيفات الكتالوج',
          articles: 'مقالات المدونة',
          resources: 'مكتبة المحتوى',
          quotes: 'طلبات عروض السعر',
          newsletter: 'مشتركو النشرة',
          users: 'صلاحيات الفريق',
          messages: 'رسائل التواصل',
        },
        dashboard: {
          stats: {
            liveShowcaseItems: {
              title: 'منتجات الرئيسية المنشورة',
              description: 'إجمالي منتجات الصفحة الرئيسية',
            },
            newQuotes: {
              title: 'طلبات عروض سعر جديدة',
              description: 'طلبات أسعار تنتظر المراجعة',
            },
            catalogProducts: {
              title: 'منتجات الكتالوج',
              description: 'منتجات منظمة داخل الكتالوج',
            },
            managedOrigins: {
              title: 'المصادر المُدارة',
              description: 'المصادر الظاهرة داخل قسم شبكة التوريد في الموقع',
            },
            managedAreas: {
              title: 'الأقسام العامة المُدارة',
              description: 'الهوية والمحتوى والتحرير الحي والمعرض والمصادر والكتالوج والمدونة',
            },
            unreadMessages: {
              title: 'رسائل جديدة',
              description: 'رسائل تواصل تنتظر المراجعة',
            },
          },
          primaryActions: {
            title: 'ابدأ من هنا',
            description: 'أكثر مهام الإدارة استخدامًا مجموعة في مكان واحد.',
            editWebsite: {
              title: 'تعديل الموقع',
              description: 'افتح المعاينة الحية وعدل النصوص أو الصور الظاهرة مباشرة.',
            },
            aboutUs: {
              title: 'إدارة من نحن',
              description: 'عدّل نبذة الشركة والنصوص ونقاط التميز في سكشن About Us.',
            },
            homeProducts: {
              title: 'إدارة منتجات الرئيسية',
              description: 'تحكم في المنتجات المميزة التي تظهر على الصفحة الرئيسية.',
            },
            catalogProducts: {
              title: 'إدارة كتالوج المنتجات',
              description: 'عدل بيانات الكتالوج المستخدمة في صفحات المنتجات ونماذج التسعير.',
            },
            leads: {
              title: 'مراجعة طلبات الأسعار',
              description: 'تابع العملاء الذين يطلبون أسعارًا أو تفاصيل توريد.',
            },
          },
          websiteAreas: {
            title: 'مناطق الموقع',
            description: 'خريطة بسيطة توضح تأثير كل قسم إداري على الموقع العام.',
            homepage: {
              title: 'الصفحة الرئيسية',
              description: 'الهيرو، النصوص، منتجات الرئيسية، مصادر التوريد، ومحتوى الهوية الظاهر.',
              meta: 'الموقع',
            },
            aboutUs: {
              title: 'من نحن',
              description: 'نبذة الشركة، الفقرات الرئيسية، منطقة اللوجو، ونقاط التميز.',
              meta: 'سكشن رئيسي',
            },
            catalog: {
              title: 'كتالوج المنتجات',
              description: 'المنتجات والتصنيفات والصور وتفاصيل المنتج وحالة التوفر.',
              meta: 'الكتالوج',
            },
            blog: {
              title: 'المدونة',
              description: 'المقالات وتصنيفات المحتوى المستخدمة في ملاحظات وأخبار التصدير.',
              meta: 'محتوى',
            },
            leads: {
              title: 'التواصل والعملاء',
              description: 'طلبات عروض السعر ورسائل التواصل ومشتركو النشرة البريدية.',
              meta: 'عملاء',
            },
          },
          managedAreas: {
            title: 'الأقسام العامة المُدارة',
            description: 'روابط مباشرة إلى مسارات التحرير المستخدمة فعليًا في الموقع الحي.',
            openLiveEditor: 'فتح المحرر الحي',
          },
          quickActions: {
            title: 'إجراءات سريعة',
            description: 'اختصارات لأكثر مهام الإدارة استخدامًا داخل الموقع.',
          },
          actions: {
            settings: {
              title: 'الشعار داخل المحرر الحي',
              description: 'اضغط على شعار الشريط العلوي داخل المعاينة لرفع صورة بديلة.',
            },
            showcase: {
              title: 'مكتبة المعرض',
              description: 'إدارة بطاقات المجموعات المميزة في الصفحة الرئيسية.',
            },
            categories: {
              title: 'تصنيفات الكتالوج',
              description: 'إنشاء وتنظيم قائمة تصنيفات الكتالوج.',
            },
            catalogProducts: {
              title: 'منتجات الكتالوج',
              description: 'التحكم في بيانات المنتجات المنظمة داخل الكتالوج.',
            },
            siteContent: {
              title: 'استوديو المحتوى',
              description: 'تعديل العناوين والنصوص والعناصر الثابتة في الفوتر.',
            },
            messages: {
              title: 'صندوق الرسائل',
              description: 'متابعة رسائل التواصل وطلبات التعاون.',
            },
          },
          sections: {
            brandIdentity: {
              title: 'هوية العلامة',
              type: 'وسائط',
              status: 'مباشر',
              description: 'تحديث شعار الشريط العلوي يتم الآن مباشرة من داخل المعاينة الحية.',
            },
            copyStudio: {
              title: 'استوديو محتوى الصفحة الرئيسية',
              type: 'محتوى',
              status: 'مباشر',
              description: 'تحرير منظم لعناوين ونصوص البطل والفوتر وبقية الأقسام الثابتة.',
            },
            liveEditor: {
              title: 'وضع التحرير الحي',
              type: 'تحرير حي',
              status: 'مباشر',
              description: 'تعديل مباشر داخل معاينة الموقع مع رفع الصور كملفات.',
            },
            showcase: {
              title: 'مكتبة المعرض',
              type: 'محتوى',
              status: 'مباشر',
              description: 'بطاقات الصفحة الرئيسية المميزة الظاهرة داخل المعرض العام.',
            },
            origins: {
              title: 'شبكة المصادر',
              type: 'محتوى',
              status: 'مباشر',
              description: 'المصادر والدول الظاهرة في قسم الشبكة على الصفحة الرئيسية.',
            },
            catalogAndBlog: {
              title: 'الكتالوج والمدونة',
              type: 'محتوى',
              status: 'مباشر',
              description: 'المنتجات والتصنيفات والمقالات المستخدمة في مناطق المحتوى العامة.',
            },
          },
        },
        pages: {
          users: {
            eyebrow: 'المستخدمون',
            title: 'مستخدمو الإدارة',
            createEditor: 'إنشاء محرر',
            firstName: 'الاسم الأول',
            lastName: 'اسم العائلة',
            email: 'البريد الإلكتروني',
            password: 'كلمة المرور',
            createUser: 'إنشاء مستخدم',
            deleteConfirm: 'هل تريد حذف هذا المستخدم؟',
            roles: {
              editor: 'محرر',
              admin: 'مدير',
            },
          },
          newsletter: {
            eyebrow: 'النشرة البريدية',
            title: 'المشتركون',
            exportCsv: 'تصدير CSV',
            searchEmail: 'ابحث بالبريد الإلكتروني',
            anyConfirmation: 'أي حالة تأكيد',
            confirmed: 'مؤكد',
            unconfirmed: 'غير مؤكد',
            pending: 'قيد الانتظار',
            anySubscription: 'أي حالة اشتراك',
            subscribed: 'مشترك',
            unsubscribed: 'ألغى الاشتراك',
            active: 'نشط',
            deleteConfirm: 'هل تريد حذف هذا المشترك؟',
          },
          messages: {
            eyebrow: 'صندوق الرسائل',
            title: 'رسائل الموقع',
            description: 'رسائل التواصل والتعاون المرسلة من زوار الموقع.',
            loading: 'جارٍ تحميل الرسائل...',
            empty: 'لا توجد رسائل في صندوق الوارد.',
            openThread: 'فتح المحادثة',
          },
          resources: {
            eyebrow: 'الموارد',
            title: 'التصنيفات والمناطق والمحطات والإحصائيات والصفحات',
            categoriesEyebrow: 'التصنيفات',
            categoriesTitle: 'تصنيفات الكتالوج',
            labels: {
              categories: 'التصنيفات',
              regions: 'المناطق',
              milestones: 'المحطات',
              stats: 'الإحصائيات',
              pages: 'الصفحات الثابتة',
            },
            fields: {
              slug: 'المعرف / المفتاح',
              nameEn: 'الاسم / العنوان EN',
              nameAr: 'الاسم / العنوان AR',
              descriptionEn: 'الوصف / المحتوى EN',
              descriptionAr: 'الوصف / المحتوى AR',
              icon: 'الأيقونة',
              value: 'القيمة',
              unit: 'الوحدة',
              latitude: 'خط العرض',
              longitude: 'خط الطول',
              year: 'السنة',
              sortOrder: 'ترتيب العرض',
            },
            regionImage: 'صورة المنطقة',
            uploadingImage: 'جارٍ رفع الصورة...',
            changeImage: 'تغيير الصورة',
            uploadImage: 'رفع صورة',
            selectedImageHelp: 'سيتم رفع الصورة المختارة عند حفظ المنطقة.',
            uploadImageHelp: 'ارفع ملفًا بدل لصق رابط صورة.',
            regionPreviewAlt: 'معاينة صورة المنطقة المختارة',
            deleteConfirm: 'هل تريد حذف هذا العنصر؟',
          },
          settings: {
            eyebrow: 'إعدادات الهوية',
            title: 'تحكم في عناصر الهوية الثابتة التي تشكل تجربة الموقع.',
            description:
              'ارفع الشعار كملف، راجع الوسائط الأخيرة، وانشر صورة الهوية المعتمدة بدون تعديل الكود.',
            recentMediaAssets: 'وسائط حديثة',
            navbarLogo: 'شعار الشريط العلوي',
            navbarLogoDescription:
              'معاينة المسودة والنسخة المنشورة للشعار الرئيسي المستخدم في الموقع.',
            draft: 'المسودة',
            live: 'المنشور',
            draftLogoAlt: 'شعار المسودة',
            publishedLogoAlt: 'الشعار المنشور',
            uploadingLogo: 'جارٍ رفع الشعار...',
            uploadLogoFile: 'رفع ملف الشعار',
            publishing: 'جارٍ النشر...',
            publishLogoLive: 'نشر الشعار',
            recentMediaLibrary: 'مكتبة الوسائط الحديثة',
            recentMediaDescription: 'استخدم الرفعات الأخيرة بسرعة كشعار منشور للموقع.',
            initialNotice: 'ارفع ملف شعار أو اختر من مكتبة الوسائط ثم انشره.',
            uploadingNotice: 'جارٍ رفع الشعار الجديد إلى مخزن وسائط NewApi...',
            uploadedNotice: 'تم رفع الشعار الجديد وحفظه كمسودة.',
            uploadError: 'تعذر رفع الشعار الآن.',
            assetAppliedNotice: 'تم تطبيق الوسيط المختار على مسودة الشعار.',
            publishingNotice: 'جارٍ نشر مسودة الشعار على الموقع...',
            publishedNotice: 'تم نشر الشعار بنجاح.',
            publishError: 'تعذر نشر الشعار الآن.',
            loadError: 'تعذر تحميل أحدث الإعدادات والوسائط الآن.',
            saveDraftError: 'تم رفع الملف، لكن تعذر حفظ مسودة الشعار.',
          },
          origins: {
            eyebrow: 'إدارة المصادر',
            title: 'شبكة مصادر التوريد',
            description: 'تحكم في الدول وتغطية التوريد المعروضة في الموقع.',
            addOrigin: 'إضافة مصدر',
            createOrigin: 'إنشاء مصدر',
            updateOrigin: 'تحديث المصدر',
            loading: 'جارٍ تحميل المصادر...',
            empty: 'لا توجد مصادر في الشبكة.',
            featuredItems: 'عناصر مميزة',
            visibilityStatus: 'حالة الظهور',
            editCoverage: 'تعديل التغطية',
            deleteOrigin: 'حذف المصدر',
            syncCards: 'تحديث الكروت',
            deleteConfirm: 'هل تريد حذف هذا المصدر؟ لا يمكن التراجع عن هذا الإجراء.',
            fields: {
              code: 'الكود، مثال EG',
              flag: 'العلم',
              countryEn: 'الدولة EN',
              countryAr: 'الدولة AR',
              focus: 'التركيز',
              featuredItems: 'العناصر المميزة',
              status: 'الحالة',
            },
          },
          products: {
            eyebrow: 'إدارة منتجات الرئيسية',
            title: 'مكتبة منتجات الصفحة الرئيسية',
            description: 'إدارة كروت المنتجات الثابتة الظاهرة في شبكة الموقع العامة.',
            addCard: 'إضافة كارت منتج',
            loading: 'جارٍ تحميل المنتجات...',
            liveCards: 'كروت منشورة',
            draftCards: 'كروت مسودة',
            totalCards: 'إجمالي الكروت المُدارة',
            empty: 'لا توجد منتجات في مكتبة العرض.',
            arTitle: 'العنوان العربي',
            notTranslated: 'غير مترجم',
            updated: 'آخر تحديث',
            editCopy: 'تعديل النص',
            editProduct: 'تعديل المنتج',
            addProduct: 'إضافة منتج جديد',
            productImage: 'صورة المنتج',
            clickUploadImage: 'اضغط لرفع صورة',
            changeImage: 'تغيير الصورة',
            uploadHint: 'المفضل: صورة PNG مربعة بخلفية شفافة.',
            categoryHint: 'تصنيفات العرض هنا مجموعات بصرية ثابتة ومنفصلة عن تصنيفات الكتالوج.',
            savingChanges: 'جارٍ حفظ التغييرات...',
            updateProduct: 'تحديث المنتج',
            createProduct: 'إنشاء المنتج',
            deleteConfirm: 'هل تريد حذف كارت المنتج؟ لا يمكن التراجع عن هذا الإجراء.',
            fields: {
              nameEn: 'اسم المنتج EN',
              nameAr: 'اسم المنتج AR',
              category: 'تصنيف العرض',
              status: 'الحالة',
              origins: 'المصادر، مفصولة بفواصل',
              descriptionEn: 'الوصف EN',
              descriptionAr: 'الوصف AR',
              note: 'ملاحظة داخلية',
            },
            placeholders: {
              nameEn: 'مثال: Premium Italian Apples',
              nameAr: 'مثال: تفاح إيطالي فاخر',
              origins: 'Italy, Greece, Costa Rica',
              descriptionEn: 'وصف تسويقي للموقع الإنجليزي...',
              descriptionAr: 'وصف تسويقي للموقع العربي...',
              note: 'ملاحظات داخلية عن هذا الكارت...',
            },
            status: {
              live: 'منشور',
              draft: 'مسودة',
              review: 'مراجعة',
            },
            categories: {
              tropical: 'استوائي',
              stone: 'فاكهة حجرية',
              citrus: 'حمضيات',
              exotic: 'فاخر',
            },
          },
          articles: {
            eyebrow: 'المقالات',
            title: 'مقالات المدونة وتصنيفاتها',
            editArticle: 'تعديل المقال',
            createArticle: 'إنشاء مقال',
            coverImage: 'صورة الغلاف',
            selectedCoverHelp: 'سيتم رفع الغلاف المختار عند حفظ المقال.',
            uploadCoverHelp: 'ارفع ملفًا بدل لصق رابط صورة الغلاف.',
            coverPreviewAlt: 'معاينة غلاف المقال المختار',
            published: 'منشور',
            saveArticle: 'حفظ المقال',
            categories: 'التصنيفات',
            updateCategory: 'تحديث التصنيف',
            addCategory: 'إضافة تصنيف',
            deleteArticleConfirm: 'هل تريد حذف هذا المقال؟',
            deleteCategoryConfirm: 'هل تريد حذف تصنيف المقالات هذا؟',
            fields: {
              slug: 'المعرف',
              titleEn: 'العنوان EN',
              titleAr: 'العنوان AR',
              category: 'التصنيف',
              excerptEn: 'الملخص EN',
              excerptAr: 'الملخص AR',
              bodyEn: 'المحتوى EN',
              bodyAr: 'المحتوى AR',
              nameEn: 'الاسم EN',
              nameAr: 'الاسم AR',
            },
          },
          catalogProducts: {
            eyebrow: 'الكتالوج',
            title: 'كتالوج المنتجات المنظم',
            manageCategories: 'إدارة التصنيفات',
            editProduct: 'تعديل المنتج',
            createProduct: 'إنشاء منتج',
            featured: 'مميز',
            saveProduct: 'حفظ المنتج',
            imagesFor: 'صور',
            chooseImageFile: 'اختيار ملف صورة',
            selectedImageHelp: 'سيتم رفع الصورة المختارة عند إضافتها.',
            imagePreviewAlt: 'معاينة صورة الكتالوج المختارة',
            cover: 'غلاف',
            addImage: 'إضافة صورة',
            hidden: 'مخفي',
            deleteProductConfirm: 'هل تريد حذف منتج الكتالوج هذا؟',
            deleteImageConfirm: 'هل تريد حذف هذه الصورة؟',
            fields: {
              originEn: 'المصدر EN',
              originAr: 'المصدر AR',
              seasonEn: 'الموسم EN',
              seasonAr: 'الموسم AR',
              calibersEn: 'الأحجام EN',
              calibersAr: 'الأحجام AR',
              packagingEn: 'التعبئة EN',
              packagingAr: 'التعبئة AR',
              shortEn: 'وصف مختصر EN',
              shortAr: 'وصف مختصر AR',
              longEn: 'وصف تفصيلي EN',
              longAr: 'وصف تفصيلي AR',
              altEn: 'النص البديل EN',
              altAr: 'النص البديل AR',
            },
          },
        },
      },
    },
  };

  constructor() {
    this.initLang();
  }

  private initLang() {
    const savedLang = readLocalStorage(this.LANG_KEY) as Language | null;
    if (savedLang === 'en' || savedLang === 'ar') {
      this.setLanguage(savedLang);
    }
    this.fetchRemoteContent();
  }

  private fetchRemoteContent(forceFresh = false) {
    this.contentApi.getContent(forceFresh).subscribe({
      next: (content) => {
        this.remoteContent.set(repairDeepText(content));
      },
      error: () => {
        this.remoteContent.set(null);
      },
    });
  }

  refreshRemoteContent(): void {
    this.fetchRemoteContent(true);
  }

  setLanguage(lang: Language, options: LanguageSetOptions = {}) {
    const { persist = true } = options;
    this.currentLang.set(lang);
    if (persist) {
      writeLocalStorage(this.LANG_KEY, lang);
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  toggleLanguage(options: LanguageSetOptions = {}) {
    const newLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang, options);
    return newLang;
  }

  translateFor(lang: Language, path: string): any {
    const remote = this.remoteContent();
    if (remote) {
      const keys = path.split('.');
      let val: any = remote;
      for (const key of keys) {
        if (val) val = val[key];
      }

      // If found in remote and it is a LocalizedText object (has the lang key)
      if (val && val[lang]) {
        return this.normalizeRenamedCopy(path, repairText(val[lang]));
      }
      // If it's a direct string (like email/phone in footer)
      if (typeof val === 'string') {
        return this.normalizeRenamedCopy(path, repairText(val));
      }
    }

    const keys = path.split('.');
    let value = this.translations[lang];
    for (const key of keys) {
      if (value) value = value[key];
    }

    if (value === undefined && lang !== 'en') {
      value = this.translations.en;
      for (const key of keys) {
        if (value) value = value[key];
      }
    }

    return this.normalizeRenamedCopy(path, repairDeepText(value ?? path));
  }

  translate(path: string): any {
    return this.translateFor(this.currentLang(), path);
  }

  translateEditable(nodeId: string, translationPath?: string): string {
    const lang = this.currentLang();
    return repairText(this.translateFor(lang, translationPath ?? nodeId));
  }

  private normalizeRenamedCopy(path: string, value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    if (
      path === 'navbar.quote' ||
      path === 'pages.catalog.requestQuote' ||
      path === 'pages.quote.eyebrow'
    ) {
      return value.replace(/request\s+(a\s+)?quote|quote request/gi, (match) =>
        match === match.toUpperCase() ? 'BECOME A SUPPLIER' : 'Become a supplier',
      );
    }

    return value;
  }
}
