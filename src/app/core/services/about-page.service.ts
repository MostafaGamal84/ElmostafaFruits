import { Injectable, computed, inject } from '@angular/core';
import {
  AboutPageContent,
  ABOUT_PAGE_SETTING_KEY,
  parseAboutPageContent,
} from '../models/about-page.model';
import { SiteSettingsService } from './site-settings.service';

@Injectable({
  providedIn: 'root',
})
export class AboutPageService {
  private readonly siteSettings = inject(SiteSettingsService);

  readonly content = computed<AboutPageContent>(() => {
    const settings = this.siteSettings.settings();
    return parseAboutPageContent(settings[ABOUT_PAGE_SETTING_KEY]);
  });
}
