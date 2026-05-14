import { LocalizedText } from './localized-text.model';
import { PagedResponse } from './article.model';

export interface CatalogProductListQuery {
  category?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CatalogProductListItem {
  id: number;
  slug: string;
  name: string;
  shortDescription?: string;
  categorySlug?: string;
  categoryName?: string;
  coverImageUrl?: string;
  isFeatured: boolean;
}

export interface CatalogProductImage {
  id: number;
  url: string;
  alt?: LocalizedText | string;
  sortOrder: number;
  isCover: boolean;
}

export interface CatalogProductDetail extends CatalogProductListItem {
  longDescription?: string;
  origin?: string;
  season?: string;
  calibers?: string;
  packagingDetails?: string;
  images?: CatalogProductImage[];
}

export interface AdminCatalogProduct {
  id: number;
  categoryId: number;
  categorySlug?: string;
  slug: string;
  name: LocalizedText;
  shortDescription?: LocalizedText;
  longDescription?: LocalizedText;
  origin?: LocalizedText;
  season?: LocalizedText;
  calibers?: LocalizedText;
  packagingDetails?: LocalizedText;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  images?: CatalogProductImage[];
}

export interface CatalogProductPayload {
  categoryId: number;
  slug?: string;
  name: LocalizedText;
  shortDescription?: LocalizedText;
  longDescription?: LocalizedText;
  origin?: LocalizedText;
  season?: LocalizedText;
  calibers?: LocalizedText;
  packagingDetails?: LocalizedText;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface CatalogProductImagePayload {
  url: string;
  alt?: LocalizedText;
  sortOrder: number;
  isCover: boolean;
}

export type CatalogProductListResponse = PagedResponse<CatalogProductListItem>;
export type AdminCatalogProductListResponse = PagedResponse<AdminCatalogProduct>;
