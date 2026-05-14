export enum ProductCategory {
  TROPICAL = 'tropical',
  STONE = 'stone',
  CITRUS = 'citrus',
  EXOTIC = 'exotic'
}

export interface Product {
  id: string;
  name: string;
  name_ar?: string;
  imageUrl: string;
  imageFilter?: string;
  origin: string[];
  varieties?: string[];
  description: string;
  description_ar?: string;
  category: ProductCategory;
  status?: string;
  updatedAt?: string;
  note?: string;
}
