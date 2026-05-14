import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ROOT_URL } from '../config/api.config';
import {
  AdminCatalogProduct,
  AdminCatalogProductListResponse,
  CatalogProductDetail,
  CatalogProductImage,
  CatalogProductImagePayload,
  CatalogProductListQuery,
  CatalogProductListResponse,
  CatalogProductPayload,
} from '../models/catalog-product.model';
import { AdminMockFallbackService } from './admin-mock-fallback.service';

@Injectable({
  providedIn: 'root',
})
export class CatalogProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly url = `${API_ROOT_URL}/products`;

  getPublicProducts(query: CatalogProductListQuery = {}): Observable<CatalogProductListResponse> {
    return this.http.get<CatalogProductListResponse>(this.url, {
      params: this.toListParams(query),
    });
  }

  getPublicProductBySlug(slug: string): Observable<CatalogProductDetail> {
    return this.http.get<CatalogProductDetail>(`${this.url}/${slug}`);
  }

  getAdminProducts(query: CatalogProductListQuery = {}): Observable<AdminCatalogProductListResponse> {
    return this.http.get<AdminCatalogProductListResponse>(`${this.url}/admin`, {
      params: this.toListParams(query),
    }).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load catalog products', () =>
          this.mock.paged<AdminCatalogProduct>(
            'catalogProducts',
            query.page ?? 1,
            query.pageSize ?? 20,
          ),
        ),
      ),
    );
  }

  getAdminProductById(id: number): Observable<AdminCatalogProduct> {
    return this.http.get<AdminCatalogProduct>(`${this.url}/admin/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load catalog product', () =>
          this.mock.getById<AdminCatalogProduct>('catalogProducts', id),
        ),
      ),
    );
  }

  createProduct(payload: CatalogProductPayload): Observable<AdminCatalogProduct> {
    return this.http.post<AdminCatalogProduct>(this.url, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'create catalog product', () =>
          this.mock.create<AdminCatalogProduct>('catalogProducts', { ...payload, images: [] }),
        ),
      ),
    );
  }

  updateProduct(id: number, payload: CatalogProductPayload): Observable<AdminCatalogProduct> {
    return this.http.put<AdminCatalogProduct>(`${this.url}/${id}`, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'update catalog product', () =>
          this.mock.update<AdminCatalogProduct>('catalogProducts', id, payload),
        ),
      ),
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete catalog product', () => {
          this.mock.delete('catalogProducts', id);
        }),
      ),
    );
  }

  addImage(id: number, payload: CatalogProductImagePayload): Observable<CatalogProductImage> {
    return this.http.post<CatalogProductImage>(`${this.url}/${id}/images`, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'add catalog product image', () =>
          this.mock.addCatalogImage(id, payload),
        ),
      ),
    );
  }

  deleteImage(id: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}/images/${imageId}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete catalog product image', () => {
          this.mock.deleteCatalogImage(id, imageId);
        }),
      ),
    );
  }

  private toListParams(query: CatalogProductListQuery): HttpParams {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('pageSize', String(query.pageSize ?? 20));

    if (query.category) {
      params = params.set('category', query.category);
    }

    if (query.featured !== undefined) {
      params = params.set('featured', String(query.featured));
    }

    return params;
  }
}
