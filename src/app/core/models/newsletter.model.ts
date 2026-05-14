import { PagedResponse } from './article.model';

export interface NewsletterSubscribePayload {
  email: string;
  locale: string;
  recaptchaToken?: string;
  honeypot?: string;
}

export interface NewsletterUnsubscribePayload {
  emailOrToken: string;
}

export interface NewsletterQuery {
  isConfirmed?: boolean;
  isUnsubscribed?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  locale: string;
  isConfirmed: boolean;
  confirmedAt?: string;
  unsubscribedAt?: string;
  consentTimestamp: string;
  ipAddress?: string;
}

export type NewsletterPagedResponse = PagedResponse<NewsletterSubscriber>;

