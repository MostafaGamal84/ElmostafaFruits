import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ROOT_URL } from '../config/api.config';
import {
  NewsletterPagedResponse,
  NewsletterQuery,
  NewsletterSubscribePayload,
  NewsletterSubscriber,
  NewsletterUnsubscribePayload,
} from '../models/newsletter.model';
import { AdminMockFallbackService } from './admin-mock-fallback.service';

@Injectable({
  providedIn: 'root',
})
export class NewsletterApiService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly url = `${API_ROOT_URL}/newsletter`;

  subscribe(payload: NewsletterSubscribePayload): Observable<unknown> {
    return this.http.post(`${this.url}/subscribe`, payload);
  }

  confirm(token: string): Observable<unknown> {
    return this.http.get(`${this.url}/confirm`, {
      params: new HttpParams().set('token', token),
    });
  }

  unsubscribe(payload: NewsletterUnsubscribePayload): Observable<unknown> {
    return this.http.post(`${this.url}/unsubscribe`, payload);
  }

  getSubscribers(query: NewsletterQuery = {}): Observable<NewsletterPagedResponse> {
    return this.http.get<NewsletterPagedResponse>(this.url, {
      params: this.toQueryParams(query),
    }).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load newsletter subscribers', () =>
          this.mock.paged<NewsletterSubscriber>(
            'subscribers',
            query.page ?? 1,
            query.pageSize ?? 20,
          ),
        ),
      ),
    );
  }

  exportCsv(query: NewsletterQuery = {}): Observable<Blob> {
    return this.http.get(`${this.url}/export.csv`, {
      params: this.toQueryParams(query),
      responseType: 'blob',
    }).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'export newsletter subscribers', () =>
          new Blob(['email,locale,isConfirmed\nsubscriber@example.com,en,true\n'], {
            type: 'text/csv',
          }),
        ),
      ),
    );
  }

  deleteSubscriber(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete newsletter subscriber', () => {
          this.mock.delete('subscribers', id);
        }),
      ),
    );
  }

  private toQueryParams(query: NewsletterQuery): HttpParams {
    let params = new HttpParams();

    if (query.isConfirmed !== undefined) {
      params = params.set('IsConfirmed', String(query.isConfirmed));
    }

    if (query.isUnsubscribed !== undefined) {
      params = params.set('IsUnsubscribed', String(query.isUnsubscribed));
    }

    if (query.search) {
      params = params.set('Search', query.search);
    }

    if (query.page !== undefined) {
      params = params.set('Page', String(query.page));
    }

    if (query.pageSize !== undefined) {
      params = params.set('PageSize', String(query.pageSize));
    }

    return params;
  }
}
