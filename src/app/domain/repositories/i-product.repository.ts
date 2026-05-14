import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface IProductRepository {
  getProducts(): Observable<Product[]>;
  getProductById(id: string): Observable<Product | undefined>;
}
