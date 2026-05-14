import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_V1_BASE_URL } from '../config/api.config';
import { VisualOverride, VisualOverridePayload } from '../models/visual-override.model';

@Injectable({
  providedIn: 'root',
})
export class VisualOverridesApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_V1_BASE_URL}/overrides`;

  getOverrides(forceFresh = false): Observable<VisualOverride[]> {
    const params = forceFresh
      ? new HttpParams().set('_', Date.now().toString())
      : undefined;

    return this.http.get<VisualOverride[]>(this.url, { params });
  }

  saveOverride(payload: VisualOverridePayload): Observable<VisualOverride> {
    return this.http.post<VisualOverride>(this.url, payload);
  }
}
