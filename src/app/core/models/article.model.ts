import { LocalizedText } from './localized-text.model';

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ArticleListQuery {
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface ArticleSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  categorySlug: string;
  categoryName: string;
  publishedAt: string;
}

export interface ArticleDetails extends ArticleSummary {
  body: string;
}

export interface AdminArticle {
  id: number;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  coverImageUrl: string;
  categoryId: number;
  categorySlug: string;
  publishedAt: string;
  isPublished: boolean;
}

export interface ArticlePayload {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  coverImageUrl: string;
  categoryId: number;
  publishedAt: string;
  isPublished: boolean;
}

