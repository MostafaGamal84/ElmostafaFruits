import { LocalizedText } from './localized-text.model';

export interface SiteContent {
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
