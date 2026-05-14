import { LocalizedText } from './localized-text.model';

export interface PublicStat {
  id: number;
  key: string;
  label: string;
  value: string;
  unit: string;
  icon: string;
  sortOrder: number;
}

export interface AdminStat {
  id: number;
  key: string;
  label: LocalizedText;
  value: string;
  unit: string;
  icon: string;
  sortOrder: number;
}

export interface StatPayload {
  key: string;
  label: LocalizedText;
  value: string;
  unit: string;
  icon: string;
  sortOrder: number;
}

