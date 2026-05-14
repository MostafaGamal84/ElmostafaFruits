import { PagedResponse } from './article.model';

export interface QuotePayload {
  fullName: string;
  company?: string;
  country?: string;
  email: string;
  phone?: string;
  quantity?: string;
  productId?: number;
  message?: string;
  attachmentUrl?: string;
  locale?: string;
  recaptchaToken?: string;
  honeypot?: string;
}

export interface Quote {
  id: number;
  fullName: string;
  company?: string;
  country?: string;
  email: string;
  phone?: string;
  quantity?: string;
  productId?: number;
  productSlug?: string;
  message?: string;
  attachmentUrl?: string;
  locale?: string;
  ipAddress?: string;
  status: number;
  createdAt: string;
}

export interface QuoteQuery {
  status?: number;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface QuoteStatusPayload {
  status: number;
}

export type QuotePagedResponse = PagedResponse<Quote>;
