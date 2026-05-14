import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { PRODUCT_REPOSITORY_TOKEN } from '../../core/tokens/repository.tokens';

@Injectable({
  providedIn: 'root'
})
export class GetProductsUseCase {
  private productRepository = inject(PRODUCT_REPOSITORY_TOKEN);

  execute(): Observable<Product[]> {
    return this.productRepository.getProducts();
  }
}
