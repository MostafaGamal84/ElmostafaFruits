import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_V1_BASE_URL } from '../config/api.config';
import {
  CmsContentEntry,
  CmsContentEntryUpsertPayload,
  CmsMediaAsset,
  CmsSiteSetting,
  CmsSiteSettingUpsertPayload,
} from '../models/cms.model';

@Injectable({
  providedIn: 'root',
})
export class CmsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_V1_BASE_URL}/cms`;

  getContent(stage: 'draft' | 'published' = 'draft'): Observable<CmsContentEntry[]> {
    return this.http.get<CmsContentEntry[]>(`${this.url}/content`, {
      params: new HttpParams().set('stage', stage),
    });
  }

  upsertContent(payload: CmsContentEntryUpsertPayload): Observable<CmsContentEntry> {
    return this.http.post<CmsContentEntry>(`${this.url}/content`, payload);
  }

  publishContent(nodeId?: string, scope?: string): Observable<unknown> {
    return this.http.post(`${this.url}/content/publish`, {
      nodeId,
      scope,
      publishAll: !nodeId,
    });
  }

  getSettings(stage: 'draft' | 'published' = 'draft'): Observable<CmsSiteSetting[]> {
    return this.http.get<CmsSiteSetting[]>(`${this.url}/settings`, {
      params: new HttpParams().set('stage', stage),
    });
  }

  getPublicSettings(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.url}/settings/public`);
  }

  upsertSetting(payload: CmsSiteSettingUpsertPayload): Observable<CmsSiteSetting> {
    return this.http.post<CmsSiteSetting>(`${this.url}/settings`, payload);
  }

  publishSettings(key?: string): Observable<unknown> {
    return this.http.post(`${this.url}/settings/publish`, {
      key,
      publishAll: !key,
    });
  }

  getMedia(): Observable<CmsMediaAsset[]> {
    return this.http.get<CmsMediaAsset[]>(`${this.url}/media`);
  }
}
