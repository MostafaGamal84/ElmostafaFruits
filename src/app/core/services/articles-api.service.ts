import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ROOT_URL } from '../config/api.config';
import { AdminMockFallbackService } from './admin-mock-fallback.service';
import {
  AdminArticle,
  ArticleDetails,
  ArticleListQuery,
  ArticlePayload,
  ArticleSummary,
  PagedResponse,
} from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class ArticlesApiService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly url = `${API_ROOT_URL}/articles`;

  getPublicArticles(query: ArticleListQuery = {}): Observable<PagedResponse<ArticleSummary>> {
    return this.http.get<PagedResponse<ArticleSummary>>(this.url, {
      params: this.toListParams(query),
    });
  }

  getPublicArticleBySlug(slug: string): Observable<ArticleDetails> {
    return this.http.get<ArticleDetails>(`${this.url}/${slug}`);
  }

  getAdminArticles(query: ArticleListQuery = {}): Observable<PagedResponse<AdminArticle>> {
    return this.http.get<PagedResponse<AdminArticle>>(`${this.url}/admin`, {
      params: this.toListParams(query),
    }).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load admin articles', () =>
          this.mock.paged<AdminArticle>('articles', query.page ?? 1, query.pageSize ?? 20),
        ),
      ),
    );
  }

  getAdminArticleById(id: number): Observable<AdminArticle> {
    return this.http.get<AdminArticle>(`${this.url}/admin/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load admin article', () =>
          this.mock.getById<AdminArticle>('articles', id),
        ),
      ),
    );
  }

  createArticle(payload: ArticlePayload): Observable<AdminArticle> {
    return this.http.post<AdminArticle>(this.url, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'create article', () =>
          this.mock.create<AdminArticle>('articles', payload),
        ),
      ),
    );
  }

  updateArticle(id: number, payload: ArticlePayload): Observable<AdminArticle> {
    return this.http.put<AdminArticle>(`${this.url}/${id}`, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'update article', () =>
          this.mock.update<AdminArticle>('articles', id, payload),
        ),
      ),
    );
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete article', () => {
          this.mock.delete('articles', id);
        }),
      ),
    );
  }

  private toListParams(query: ArticleListQuery): HttpParams {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('pageSize', String(query.pageSize ?? 20));

    if (query.category) {
      params = params.set('category', query.category);
    }

    return params;
  }
}
