import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ROOT_URL } from '../config/api.config';
import { AdminRegion, Region, RegionPayload } from '../models/region.model';
import { AdminMockFallbackService } from './admin-mock-fallback.service';

@Injectable({
  providedIn: 'root',
})
export class RegionsApiService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly url = `${API_ROOT_URL}/regions`;

  getPublicRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(this.url);
  }

  getAdminRegions(): Observable<AdminRegion[]> {
    return this.http.get<AdminRegion[]>(`${this.url}/admin`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load regions', () => this.mock.list<AdminRegion>('regions')),
      ),
    );
  }

  getAdminRegionById(id: number): Observable<AdminRegion> {
    return this.http.get<AdminRegion>(`${this.url}/admin/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load region', () =>
          this.mock.getById<AdminRegion>('regions', id),
        ),
      ),
    );
  }

  createRegion(payload: RegionPayload): Observable<AdminRegion> {
    return this.http.post<AdminRegion>(this.url, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'create region', () =>
          this.mock.create<AdminRegion>('regions', payload),
        ),
      ),
    );
  }

  updateRegion(id: number, payload: RegionPayload): Observable<AdminRegion> {
    return this.http.put<AdminRegion>(`${this.url}/${id}`, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'update region', () =>
          this.mock.update<AdminRegion>('regions', id, payload),
        ),
      ),
    );
  }

  deleteRegion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete region', () => {
          this.mock.delete('regions', id);
        }),
      ),
    );
  }
}
