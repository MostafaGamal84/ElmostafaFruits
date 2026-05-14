import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_V1_BASE_URL } from '../config/api.config';
import {
  PortfolioProductApi,
  PortfolioProductPayload,
} from '../models/portfolio-product.model';

@Injectable({
  providedIn: 'root',
})
export class PortfolioProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_V1_BASE_URL}/products`;

  getProducts(): Observable<PortfolioProductApi[]> {
    return this.http.get<PortfolioProductApi[]>(this.url);
  }

  createProduct(payload: PortfolioProductPayload): Observable<PortfolioProductApi> {
    return this.http.post<PortfolioProductApi>(this.url, payload);
  }

  updateProduct(id: string, payload: PortfolioProductPayload): Observable<PortfolioProductApi> {
    return this.http.put<PortfolioProductApi>(`${this.url}/${id}`, payload);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
