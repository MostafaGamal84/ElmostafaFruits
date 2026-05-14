export interface Origin {
  id?: string;
  flag: string;
  country: string;
  country_ar?: string;
  products: string[];
  latitude?: number | null;
  longitude?: number | null;
}
