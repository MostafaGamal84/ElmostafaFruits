import { Product, ProductCategory } from '../../domain/models/product.model';

export class ProductMapper {
  static fromJson(json: any): Product {
    return {
      id: json.id,
      name: json.name,
      name_ar: json.name_ar,
      origin: json.origin as string[],
      varieties: json.varieties as string[] | undefined,
      description: json.description,
      description_ar: json.description_ar,
      category: json.category as ProductCategory,
      imageUrl: json.imageUrl,
      imageFilter: json.imageFilter ?? json.image_filter,
      status: json.status,
      updatedAt: json.updatedAt,
      note: json.note,
    };
  }
}
