import { LocalizedText } from './localized-text.model';

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  productCount: number;
}

export interface AdminCategory {
  id: number;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export interface CategoryPayload {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

