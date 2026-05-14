import { LocalizedText } from './localized-text.model';

export interface Milestone {
  id: number;
  year: number;
  title: string;
  description: string;
  sortOrder: number;
}

export interface AdminMilestone {
  id: number;
  year: number;
  title: LocalizedText;
  description: LocalizedText;
  sortOrder: number;
}

export interface MilestonePayload {
  year: number;
  title: LocalizedText;
  description: LocalizedText;
  sortOrder: number;
}

