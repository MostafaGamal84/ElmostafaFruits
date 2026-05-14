import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ROOT_URL } from '../config/api.config';
import { AdminCategory, Category, CategoryPayload } from '../models/category.model';
import { AdminMockFallbackService } from './admin-mock-fallback.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesApiService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly url = `${API_ROOT_URL}/categories`;

  getPublicCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url);
  }

  getPublicCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.url}/${slug}`);
  }

  getAdminCategories(): Observable<AdminCategory[]> {
    return this.http.get<AdminCategory[]>(`${this.url}/admin`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load categories', () =>
          this.mock.list<AdminCategory>('categories'),
        ),
      ),
    );
  }

  getAdminCategoryById(id: number): Observable<AdminCategory> {
    return this.http.get<AdminCategory>(`${this.url}/admin/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load category', () =>
          this.mock.getById<AdminCategory>('categories', id),
        ),
      ),
    );
  }

  createCategory(payload: CategoryPayload): Observable<AdminCategory> {
    return this.http.post<AdminCategory>(this.url, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'create category', () =>
          this.mock.create<AdminCategory>('categories', { ...payload, productCount: 0 }),
        ),
      ),
    );
  }

  updateCategory(id: number, payload: CategoryPayload): Observable<AdminCategory> {
    return this.http.put<AdminCategory>(`${this.url}/${id}`, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'update category', () =>
          this.mock.update<AdminCategory>('categories', id, payload),
        ),
      ),
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete category', () => {
          this.mock.delete('categories', id);
        }),
      ),
    );
  }
}
