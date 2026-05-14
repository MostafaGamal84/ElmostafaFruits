export interface ContactMessagePayload {
  name: string;
  email: string;
  contactType?: 'supplier' | 'customer';
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  id: string;
  success: boolean;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  summary: string;
  message?: string | null;
  body?: string | null;
  contactType?: 'supplier' | 'customer' | string | null;
  status: string;
  createdAt: string;
}
