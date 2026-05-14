import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ROOT_URL } from '../config/api.config';
import { AdminStat, PublicStat, StatPayload } from '../models/stat.model';
import { AdminMockFallbackService } from './admin-mock-fallback.service';

@Injectable({
  providedIn: 'root',
})
export class StatsApiService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly url = `${API_ROOT_URL}/stats`;

  getPublicStats(): Observable<PublicStat[]> {
    return this.http.get<PublicStat[]>(this.url);
  }

  getAdminStats(): Observable<AdminStat[]> {
    return this.http.get<AdminStat[]>(`${this.url}/admin`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load stats', () => this.mock.list<AdminStat>('stats')),
      ),
    );
  }

  createStat(payload: StatPayload): Observable<AdminStat> {
    return this.http.post<AdminStat>(this.url, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'create stat', () => this.mock.create<AdminStat>('stats', payload)),
      ),
    );
  }

  updateStat(id: number, payload: StatPayload): Observable<AdminStat> {
    return this.http.put<AdminStat>(`${this.url}/${id}`, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'update stat', () =>
          this.mock.update<AdminStat>('stats', id, payload),
        ),
      ),
    );
  }

  deleteStat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete stat', () => {
          this.mock.delete('stats', id);
        }),
      ),
    );
  }
}
