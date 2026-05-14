import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FilterProductsUseCase {
  execute(products: Product[], originFilter: string | null): Product[] {
    if (!originFilter) {
      return products;
    }
    return products.filter(product => product.origin.includes(originFilter));
  }
}
