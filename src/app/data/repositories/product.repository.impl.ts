import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { IProductRepository } from '../../domain/repositories/i-product.repository';
import { Product } from '../../domain/models/product.model';
import { ProductMapper } from '../mappers/product.mapper';
import { API_V1_BASE_URL } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProductRepositoryImpl implements IProductRepository {
  private http = inject(HttpClient);
  private readonly url = `${API_V1_BASE_URL}/products`;
  
  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.url).pipe(
      catchError(() => this.http.get<{ products: any[] }>('assets/data.json').pipe(map((data) => data.products))),
      map((products) => products.map((p) => ProductMapper.fromJson(p))),
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.getProducts().pipe(
      map(products => products.find(p => p.id === id))
    );
  }
}
