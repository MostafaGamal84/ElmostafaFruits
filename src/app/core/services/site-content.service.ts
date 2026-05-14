import { Injectable, inject, signal } from '@angular/core';
import { SiteContentApiService } from './site-content-api.service';
import { SiteContent } from '../models/site-content.model';
import { repairDeepText, repairText } from '../utils/text-normalizer.util';
import { readLocalStorage, writeLocalStorage } from '../utils/browser-storage.util';

export type EditableLocale = 'en' | 'ar';

interface LocalizedText {
  en: string;
  ar: string;
}

export interface LocalizedSiteContent {
  navbar: {
    about: LocalizedText;
    products: LocalizedText;
    origins: LocalizedText;
    catalog: LocalizedText;
    blog: LocalizedText;
    quote: LocalizedText;
    contact: LocalizedText;
    adminLink: LocalizedText;
  };
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    subtitle: LocalizedText;
    cta: LocalizedText;
  };
  footer: {
    brandText: LocalizedText;
    description: LocalizedText;
    address: LocalizedText;
    email: string;
    phone: string;
  };
}

const DEFAULT_CONTENT: LocalizedSiteContent = {
  navbar: {
    about: { en: 'About', ar: 'عنّا' },
    products: { en: 'Products', ar: 'منتجاتنا' },
    origins: { en: 'Origins', ar: 'المصادر' },
    catalog: { en: 'Catalog', ar: 'الكتالوج' },
    blog: { en: 'Blog', ar: 'المدونة' },
    quote: { en: 'Become a Supplier', ar: 'كن موردا' },
    contact: { en: 'Request a Quote', ar: 'اطلب عرض سعر' },
    adminLink: { en: 'Admin Login', ar: 'دخول الأدمن' },
  },
  hero: {
    eyebrow: { en: 'PREMIUM FRUIT IMPORTERS', ar: 'مستوردو كبار الفواكه الفاخرة' },
    title: { en: 'EL MOSTAFA', ar: 'المصطفى' },
    subtitle: {
      en: "Cairo's leading importer of premium tropical and exotic fruits. Sourced globally, delivered fresh.",
      ar: 'المستورد الرائد للفواكه الاستوائية والغريبة الفاخرة في القاهرة. مستوردة عالميًا، ومسلّمة طازجة.',
    },
    cta: { en: 'EXPLORE PRODUCTS', ar: 'استكشف منتجاتنا' },
  },
  footer: {
    brandText: {
      en: 'EL MOSTAFA',
      ar: '\u0627\u0644\u0645\u0635\u0637\u0641\u0649',
    },
    description: {
      en: 'Premium quality fruit importers serving Cairo with the finest selection from around the globe since 2010.',
      ar: 'مستوردو فواكه بجودة عالية نخدم القاهرة بأفضل الاختيارات من جميع أنحاء العالم منذ عام 2010.',
    },
    address: {
      en: 'Cairo, Egypt',
      ar: 'القاهرة، مصر',
    },
    email: 'contact@elmostafafruits.com',
    phone: '+20 100 000 0000',
  },
};

@Injectable({
  providedIn: 'root',
})
export class SiteContentService {
  private readonly siteContentApi = inject(SiteContentApiService);
  private readonly STORAGE_KEY = 'elmostafa_mock_site_content_v1';
  readonly content = signal<LocalizedSiteContent>(this.loadContent());

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY) {
        this.content.set(this.loadContent());
      }
    });

    this.refreshContent(false);
  }

  getNavbarLabel(key: keyof LocalizedSiteContent['navbar'], locale: EditableLocale): string {
    return this.normalizeNavbarLabel(key, locale, repairText(this.content().navbar[key][locale]));
  }

  getHeroValue(key: keyof LocalizedSiteContent['hero'], locale: EditableLocale): string {
    return repairText(this.content().hero[key][locale]);
  }

  getFooterValue(key: keyof LocalizedSiteContent['footer'], locale: EditableLocale): string {
    const value = this.content().footer[key];

    if (typeof value === 'string') {
      return repairText(value);
    }

    return repairText(value[locale]);
  }

  getValue(nodeId: string, locale: EditableLocale): string {
    const [section, field] = nodeId.split('.');
    const state = this.content();

    if (section === 'navbar' && field in state.navbar) {
      return repairText(state.navbar[field as keyof LocalizedSiteContent['navbar']][locale]);
    }

    if (section === 'hero' && field in state.hero) {
      return repairText(state.hero[field as keyof LocalizedSiteContent['hero']][locale]);
    }

    if (section === 'footer' && field in state.footer) {
      const footerValue = state.footer[field as keyof LocalizedSiteContent['footer']];
      return repairText(typeof footerValue === 'string' ? footerValue : footerValue[locale]);
    }

    return '';
  }

  setValue(nodeId: string, locale: EditableLocale, value: string): void {
    const [section, field] = nodeId.split('.');
    const state = this.content();

    if (section === 'navbar' && field in state.navbar) {
      this.content.update((current) => ({
        ...current,
        navbar: {
          ...current.navbar,
          [field as keyof LocalizedSiteContent['navbar']]: {
            ...current.navbar[field as keyof LocalizedSiteContent['navbar']],
            [locale]: value,
          },
        },
      }));
      this.persist();
      return;
    }

    if (section === 'hero' && field in state.hero) {
      this.content.update((current) => ({
        ...current,
        hero: {
          ...current.hero,
          [field as keyof LocalizedSiteContent['hero']]: {
            ...current.hero[field as keyof LocalizedSiteContent['hero']],
            [locale]: value,
          },
        },
      }));
      this.persist();
      return;
    }

    if (section === 'footer' && field in state.footer) {
      const footerValue = state.footer[field as keyof LocalizedSiteContent['footer']];

      if (typeof footerValue === 'string') {
        this.content.update((current) => ({
          ...current,
          footer: {
            ...current.footer,
            [field as keyof LocalizedSiteContent['footer']]: value,
          },
        }));
      } else {
        this.content.update((current) => ({
          ...current,
          footer: {
            ...current.footer,
            [field as keyof LocalizedSiteContent['footer']]: {
              ...(current.footer[field as keyof LocalizedSiteContent['footer']] as LocalizedText),
              [locale]: value,
            },
          },
        }));
      }

      this.persist();
    }
  }

  refreshContent(forceFresh = true): void {
    this.siteContentApi.getContent(forceFresh).subscribe({
      next: (content) => {
        this.content.set(
          repairDeepText(this.mergeContent(content as unknown as Partial<LocalizedSiteContent>)),
        );
        this.persistLocal();
      },
      error: () => undefined,
    });
  }

  private mergeContent(content?: Partial<LocalizedSiteContent> | Record<string, unknown> | null): LocalizedSiteContent {
    const navbar = content?.['navbar'] as Partial<LocalizedSiteContent['navbar']> | undefined;
    const hero = content?.['hero'] as Partial<LocalizedSiteContent['hero']> | undefined;
    const footer = content?.['footer'] as
      | (Partial<LocalizedSiteContent['footer']> & {
          brandText?: Partial<LocalizedText> | string | null;
        })
      | undefined;

    return {
      navbar: {
        about: this.mergeLocalizedText(DEFAULT_CONTENT.navbar.about, navbar?.about),
        products: this.mergeLocalizedText(DEFAULT_CONTENT.navbar.products, navbar?.products),
        origins: this.mergeLocalizedText(DEFAULT_CONTENT.navbar.origins, navbar?.origins),
        catalog: this.mergeLocalizedText(DEFAULT_CONTENT.navbar.catalog, navbar?.catalog),
        blog: this.mergeLocalizedText(DEFAULT_CONTENT.navbar.blog, navbar?.blog),
        quote: this.mergeLocalizedText(DEFAULT_CONTENT.navbar.quote, navbar?.quote),
        contact: this.mergeLocalizedText(DEFAULT_CONTENT.navbar.contact, navbar?.contact),
        adminLink: this.mergeLocalizedText(DEFAULT_CONTENT.navbar.adminLink, navbar?.adminLink),
      },
      hero: {
        eyebrow: this.mergeLocalizedText(DEFAULT_CONTENT.hero.eyebrow, hero?.eyebrow),
        title: this.mergeLocalizedText(DEFAULT_CONTENT.hero.title, hero?.title),
        subtitle: this.mergeLocalizedText(DEFAULT_CONTENT.hero.subtitle, hero?.subtitle),
        cta: this.mergeLocalizedText(DEFAULT_CONTENT.hero.cta, hero?.cta),
      },
      footer: {
        brandText: this.mergeLocalizedTextValue(DEFAULT_CONTENT.footer.brandText, footer?.brandText),
        description: this.mergeLocalizedText(DEFAULT_CONTENT.footer.description, footer?.description),
        address: this.mergeLocalizedText(DEFAULT_CONTENT.footer.address, footer?.address),
        email: this.mergeString(DEFAULT_CONTENT.footer.email, footer?.email),
        phone: this.mergeString(DEFAULT_CONTENT.footer.phone, footer?.phone),
      },
    };
  }

  private mergeLocalizedText(fallback: LocalizedText, value?: Partial<LocalizedText> | null): LocalizedText {
    return {
      en: this.mergeString(fallback.en, value?.en),
      ar: this.mergeString(fallback.ar, value?.ar),
    };
  }

  private mergeLocalizedTextValue(
    fallback: LocalizedText,
    value?: Partial<LocalizedText> | string | null,
  ): LocalizedText {
    if (typeof value === 'string') {
      return this.mergeLegacyLocalizedText(fallback, value);
    }

    return this.mergeLocalizedText(fallback, value);
  }

  private mergeLegacyLocalizedText(fallback: LocalizedText, value: string): LocalizedText {
    const normalized = String(value ?? '').trim();

    if (!normalized) {
      return fallback;
    }

    if (/[\u0600-\u06FF]/.test(normalized)) {
      return {
        en: fallback.en,
        ar: normalized,
      };
    }

    return {
      en: normalized,
      ar: fallback.ar,
    };
  }

  private mergeString(fallback: string, value?: string | null): string {
    const normalized = String(value ?? '').trim();
    return normalized ? String(value) : fallback;
  }

  private normalizeNavbarLabel(
    key: keyof LocalizedSiteContent['navbar'],
    locale: EditableLocale,
    value: string,
  ): string {
    if (key !== 'quote') {
      if (key === 'contact') {
        return this.normalizeContactLabel(locale, value);
      }

      return value;
    }

    if (locale === 'ar' && /عرض\s*سعر|التسعير/.test(value)) {
      return 'كن موردا';
    }

    return value.replace(/request\s+(a\s+)?quote/gi, 'Become a Supplier');
  }

  private normalizeContactLabel(locale: EditableLocale, value: string): string {
    if (locale === 'ar' && /تواصل|contact/i.test(value)) {
      return 'اطلب عرض سعر';
    }

    return value.replace(/^contact$/i, 'Request a Quote');
  }

  private loadContent(): LocalizedSiteContent {
    const raw = readLocalStorage(this.STORAGE_KEY);

    if (!raw) {
      return repairDeepText(this.mergeContent());
    }

    try {
      return repairDeepText(this.mergeContent(JSON.parse(raw) as Partial<LocalizedSiteContent>));
    } catch {
      return repairDeepText(this.mergeContent());
    }
  }

  private persist(): void {
    this.persistLocal();
    this.siteContentApi.updateContent(this.content() as unknown as SiteContent).subscribe({
      error: () => undefined,
    });
  }

  private persistLocal(): void {
    writeLocalStorage(this.STORAGE_KEY, JSON.stringify(repairDeepText(this.content())));
  }
}
