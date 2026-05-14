import { LocalizedText } from './localized-text.model';

export interface StaticPage {
  id: number;
  slug: string;
  title: string;
  body: string;
}

export interface AdminStaticPage {
  id: number;
  slug: string;
  title: LocalizedText;
  body: LocalizedText;
}

export interface StaticPagePayload {
  slug: string;
  title: LocalizedText;
  body: LocalizedText;
}

