import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ROOT_URL } from '../config/api.config';
import { AdminMockFallbackService } from './admin-mock-fallback.service';
import {
  AdminArticleCategory,
  ArticleCategory,
  ArticleCategoryPayload,
} from '../models/article-category.model';

@Injectable({
  providedIn: 'root',
})
export class ArticleCategoriesApiService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly url = `${API_ROOT_URL}/article-categories`;

  getPublicCategories(): Observable<ArticleCategory[]> {
    return this.http.get<ArticleCategory[]>(this.url);
  }

  getAdminCategories(): Observable<AdminArticleCategory[]> {
    return this.http.get<AdminArticleCategory[]>(`${this.url}/admin`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load article categories', () =>
          this.mock.list<AdminArticleCategory>('articleCategories'),
        ),
      ),
    );
  }

  createCategory(payload: ArticleCategoryPayload): Observable<AdminArticleCategory> {
    return this.http.post<AdminArticleCategory>(this.url, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'create article category', () =>
          this.mock.create<AdminArticleCategory>('articleCategories', payload),
        ),
      ),
    );
  }

  updateCategory(
    id: number,
    payload: ArticleCategoryPayload,
  ): Observable<AdminArticleCategory> {
    return this.http.put<AdminArticleCategory>(`${this.url}/${id}`, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'update article category', () =>
          this.mock.update<AdminArticleCategory>('articleCategories', id, payload),
        ),
      ),
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete article category', () => {
          this.mock.delete('articleCategories', id);
        }),
      ),
    );
  }
}
