import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_V1_BASE_URL } from '../config/api.config';
import { SiteContent } from '../models/site-content.model';

@Injectable({
  providedIn: 'root',
})
export class SiteContentApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_V1_BASE_URL}/content`;

  getContent(forceFresh = false): Observable<SiteContent> {
    const params = forceFresh
      ? new HttpParams().set('_', Date.now().toString())
      : undefined;

    return this.http.get<SiteContent>(this.url, { params });
  }

  updateContent(content: SiteContent): Observable<SiteContent> {
    return this.http.put<SiteContent>(this.url, content);
  }
}
