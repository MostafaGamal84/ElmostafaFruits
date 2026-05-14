import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ROOT_URL } from '../config/api.config';
import { AdminStaticPage, StaticPage, StaticPagePayload } from '../models/static-page.model';
import { AdminMockFallbackService } from './admin-mock-fallback.service';

@Injectable({
  providedIn: 'root',
})
export class StaticPagesApiService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly url = `${API_ROOT_URL}/pages`;

  getPublicPageBySlug(slug: string): Observable<StaticPage> {
    return this.http.get<StaticPage>(`${this.url}/${slug}`);
  }

  getAdminPages(): Observable<AdminStaticPage[]> {
    return this.http.get<AdminStaticPage[]>(`${this.url}/admin`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load static pages', () =>
          this.mock.list<AdminStaticPage>('pages'),
        ),
      ),
    );
  }

  getAdminPageById(id: number): Observable<AdminStaticPage> {
    return this.http.get<AdminStaticPage>(`${this.url}/admin/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load static page', () =>
          this.mock.getById<AdminStaticPage>('pages', id),
        ),
      ),
    );
  }

  upsertPage(payload: StaticPagePayload): Observable<AdminStaticPage> {
    return this.http.post<AdminStaticPage>(this.url, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'upsert static page', () => {
          const existing = this.mock
            .list<AdminStaticPage>('pages')
            .find((page) => page.slug === payload.slug);

          return existing
            ? this.mock.update<AdminStaticPage>('pages', existing.id, payload)
            : this.mock.create<AdminStaticPage>('pages', payload);
        }),
      ),
    );
  }

  createPage(payload: StaticPagePayload): Observable<AdminStaticPage> {
    return this.upsertPage(payload);
  }

  deletePage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete static page', () => {
          this.mock.delete('pages', id);
        }),
      ),
    );
  }
}
