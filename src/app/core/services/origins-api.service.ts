import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_V1_BASE_URL } from '../config/api.config';
import { OriginApi, OriginCreatePayload, OriginPayload } from '../models/origin-api.model';

@Injectable({
  providedIn: 'root',
})
export class OriginsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_V1_BASE_URL}/origins`;

  getOrigins(): Observable<OriginApi[]> {
    return this.http.get<OriginApi[]>(this.url);
  }

  createOrigin(payload: OriginCreatePayload): Observable<OriginApi> {
    return this.http.post<OriginApi>(this.url, payload);
  }

  updateOrigin(id: string, payload: OriginPayload): Observable<OriginApi> {
    return this.http.put<OriginApi>(`${this.url}/${id}`, payload);
  }

  deleteOrigin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
