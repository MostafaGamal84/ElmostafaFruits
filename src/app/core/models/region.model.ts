import { LocalizedText } from './localized-text.model';

export interface Region {
  id: number;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  sortOrder: number;
}

export interface AdminRegion {
  id: number;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  latitude: number;
  longitude: number;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface RegionPayload {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  latitude: number;
  longitude: number;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

