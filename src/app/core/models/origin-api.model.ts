export interface OriginApi {
  id: string;
  flag: string;
  country: string;
  country_ar?: string;
  latitude?: number | null;
  longitude?: number | null;
  products: string[];
}

export interface OriginPayload {
  country: string;
  country_ar?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface OriginCreatePayload extends OriginPayload {
  id: string;
}
