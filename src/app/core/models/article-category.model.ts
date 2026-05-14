import { LocalizedText } from './localized-text.model';

export interface ArticleCategory {
  id: number;
  slug: string;
  name: string;
}

export interface AdminArticleCategory {
  id: number;
  slug: string;
  name: LocalizedText;
}

export interface ArticleCategoryPayload {
  slug: string;
  name: LocalizedText;
}

