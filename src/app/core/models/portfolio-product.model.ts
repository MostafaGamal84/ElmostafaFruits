export interface PortfolioProductApi {
  id: string;
  name: string;
  name_ar?: string;
  category: string;
  origin: string[];
  varieties?: string[];
  imageUrl: string;
  image_filter?: string | null;
  status: string;
  updatedAt?: string;
  note?: string;
  description: string;
  description_ar?: string;
}

export interface PortfolioProductPayload {
  name: string;
  name_ar?: string;
  category: string;
  origin: string[];
  varieties?: string[];
  imageUrl: string;
  image_filter?: string | null;
  status: string;
  note?: string;
  description: string;
  description_ar?: string;
}

