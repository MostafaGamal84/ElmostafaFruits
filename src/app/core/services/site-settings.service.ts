import { Injectable, inject, signal } from '@angular/core';
import { CmsApiService } from './cms-api.service';
import { resolveAssetUrl, toStoredAssetUrl } from '../utils/asset-url.util';

@Injectable({
  providedIn: 'root',
})
export class SiteSettingsService {
  private readonly cmsApi = inject(CmsApiService);
  readonly settings = signal<Record<string, string>>({});

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.cmsApi.getPublicSettings().subscribe({
      next: (settings) => this.settings.set(settings),
      error: () => undefined,
    });
  }

  getValue(key: string, fallback = ''): string {
    const value = this.settings()[key] || fallback;
    return key === 'brand.logo' ? resolveAssetUrl(value) : value;
  }

  setValue(key: string, value: string): void {
    const nextValue = key === 'brand.logo' ? toStoredAssetUrl(value) : value;
    this.settings.update((current) => ({
      ...current,
      [key]: nextValue,
    }));
  }
}
