import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CmsApiService } from '../../../core/services/cms-api.service';
import { UploadsApiService } from '../../../core/services/uploads-api.service';
import { CmsMediaAsset, CmsSiteSetting } from '../../../core/models/cms.model';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { resolveAssetUrl, toStoredAssetUrl } from '../../../core/utils/asset-url.util';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-grid">
      <div class="hero-card">
        <div>
          <span class="eyebrow">{{ lang.translate('admin.pages.settings.eyebrow') }}</span>
          <h2>{{ lang.translate('admin.pages.settings.title') }}</h2>
          <p>
            {{ lang.translate('admin.pages.settings.description') }}
          </p>
        </div>

        <div class="hero-badge">
          <strong>{{ recentMedia().length }}</strong>
          <span>{{ lang.translate('admin.pages.settings.recentMediaAssets') }}</span>
        </div>
      </div>

      <div class="notice">{{ notice() }}</div>

      <div class="panel-grid">
        <section class="panel logo-panel">
          <div class="panel-head">
            <div>
              <h3>{{ lang.translate('admin.pages.settings.navbarLogo') }}</h3>
              <p>{{ lang.translate('admin.pages.settings.navbarLogoDescription') }}</p>
            </div>
          </div>

          <div class="logo-grid">
            <article class="preview-card">
              <span class="preview-label">{{ lang.translate('admin.pages.settings.draft') }}</span>
              <div class="logo-preview">
                <img
                  [src]="resolveImageSrc(draftLogo() || fallbackLogo)"
                  [alt]="lang.translate('admin.pages.settings.draftLogoAlt')"
                  (error)="handleImageError($event)"
                />
              </div>
            </article>

            <article class="preview-card">
              <span class="preview-label">{{ lang.translate('admin.pages.settings.live') }}</span>
              <div class="logo-preview">
                <img
                  [src]="resolveImageSrc(publishedLogo() || fallbackLogo)"
                  [alt]="lang.translate('admin.pages.settings.publishedLogoAlt')"
                  (error)="handleImageError($event)"
                />
              </div>
            </article>
          </div>

          <div class="actions-row">
            <label class="upload-cta" [class.disabled]="uploading()">
              <input
                type="file"
                accept="image/*"
                (change)="onLogoSelected($event)"
                [disabled]="uploading()"
              />
              <span>
                {{
                  uploading()
                    ? lang.translate('admin.pages.settings.uploadingLogo')
                    : lang.translate('admin.pages.settings.uploadLogoFile')
                }}
              </span>
            </label>

            <button
              type="button"
              class="primary"
              (click)="publishLogo()"
              [disabled]="publishing() || !draftLogo()"
            >
              {{
                publishing()
                  ? lang.translate('admin.pages.settings.publishing')
                  : lang.translate('admin.pages.settings.publishLogoLive')
              }}
            </button>
          </div>
        </section>

        <section class="panel library-panel">
          <div class="panel-head">
            <div>
              <h3>{{ lang.translate('admin.pages.settings.recentMediaLibrary') }}</h3>
              <p>{{ lang.translate('admin.pages.settings.recentMediaDescription') }}</p>
            </div>
          </div>

          <div class="media-grid">
            <button
              type="button"
              class="media-card"
              *ngFor="let asset of recentMedia()"
              (click)="useExistingAsset(asset)"
            >
              <div class="media-thumb">
                <img
                  [src]="resolveImageSrc(asset.url)"
                  [alt]="asset.originalFileName"
                  (error)="handleImageError($event)"
                />
              </div>
              <strong>{{ asset.originalFileName }}</strong>
              <small>{{ asset.folder }} · {{ formatSize(asset.size) }}</small>
            </button>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [
    `
      .page-grid {
        display: grid;
        gap: 20px;
      }

      .hero-card,
      .panel {
        border-radius: 28px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition:
          background 0.4s ease,
          border-color 0.4s ease;
      }

      .hero-card {
        display: grid;
        grid-template-columns: minmax(0, 1.3fr) auto;
        gap: 24px;
        padding: 28px;
        background:
          radial-gradient(circle at top right, rgba(245, 124, 0, 0.1), transparent 35%),
          var(--card-bg);
      }

      .eyebrow {
        display: inline-block;
        margin-bottom: 12px;
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.8rem;
        font-weight: 800;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      h2,
      h3 {
        color: var(--text-primary);
      }

      .hero-card p,
      .panel-head p,
      .notice,
      .preview-label,
      .media-card small {
        color: var(--text-secondary);
      }

      .hero-card p {
        margin-top: 12px;
        max-width: 680px;
        line-height: 1.7;
      }

      .hero-badge {
        align-self: center;
        justify-self: end;
        display: grid;
        gap: 4px;
        min-width: 180px;
        padding: 18px;
        border-radius: 22px;
        border: 1px solid rgba(245, 124, 0, 0.22);
        background: rgba(245, 124, 0, 0.08);
        text-align: center;
      }

      .hero-badge strong {
        font-size: clamp(2rem, 4vw, 2.8rem);
        color: var(--text-primary);
      }

      .notice {
        min-height: 24px;
      }

      .panel-grid {
        display: grid;
        grid-template-columns: minmax(340px, 0.95fr) minmax(0, 1.05fr);
        gap: 18px;
      }

      .panel {
        padding: 22px;
      }

      .panel-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 18px;
      }

      .logo-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .preview-card,
      .media-card {
        border-radius: 22px;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
      }

      .preview-card {
        padding: 14px;
      }

      .preview-label {
        display: inline-block;
        margin-bottom: 10px;
        font-size: 0.82rem;
        font-weight: 700;
      }

      .logo-preview {
        display: grid;
        place-items: center;
        min-height: 180px;
        padding: 18px;
        border-radius: 18px;
        background:
          linear-gradient(135deg, rgba(245, 124, 0, 0.06), rgba(211, 47, 47, 0.06)),
          var(--card-bg);
      }

      .logo-preview img {
        max-width: 100%;
        max-height: 120px;
        object-fit: contain;
      }

      .actions-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 18px;
      }

      .upload-cta,
      .primary {
        min-height: 50px;
        border-radius: 16px;
        padding: 12px 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        transition: all 0.25s ease;
      }

      .upload-cta {
        position: relative;
        overflow: hidden;
        border: 1px dashed rgba(245, 124, 0, 0.4);
        background: rgba(245, 124, 0, 0.08);
        color: var(--text-primary);
      }

      .upload-cta input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }

      .upload-cta.disabled,
      .primary:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .primary {
        color: #fff;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      }

      .primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(245, 124, 0, 0.35);
      }

      .media-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .media-card {
        padding: 12px;
        text-align: start;
        cursor: pointer;
        transition:
          transform 0.25s ease,
          border-color 0.25s ease;
      }

      .media-card:hover {
        transform: translateY(-2px);
        border-color: rgba(245, 124, 0, 0.32);
      }

      .media-thumb {
        overflow: hidden;
        aspect-ratio: 1;
        border-radius: 16px;
        margin-bottom: 10px;
        background: rgba(245, 124, 0, 0.04);
      }

      .media-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .media-card strong,
      .media-card small {
        display: block;
      }

      .media-card strong {
        color: var(--text-primary);
        margin-bottom: 4px;
        word-break: break-word;
      }

      @media (max-width: 980px) {
        .hero-card,
        .panel-grid,
        .logo-grid,
        .media-grid {
          grid-template-columns: 1fr;
        }

        .hero-badge {
          justify-self: stretch;
        }
      }
    `,
  ],
})
export class AdminSettingsComponent implements OnInit {
  private readonly cmsApi = inject(CmsApiService);
  private readonly uploadsApi = inject(UploadsApiService);
  private readonly siteSettings = inject(SiteSettingsService);
  readonly lang = inject(LanguageService);

  readonly uploading = signal(false);
  readonly publishing = signal(false);
  readonly draftLogo = signal('');
  readonly publishedLogo = signal('');
  readonly media = signal<CmsMediaAsset[]>([]);
  readonly notice = signal('');

  readonly recentMedia = computed(() => this.media().slice(0, 12));
  readonly fallbackLogo = '/assets/logo.png';

  ngOnInit(): void {
    this.notice.set(this.lang.translate('admin.pages.settings.initialNotice'));
    this.loadData();
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    this.uploading.set(true);
    this.notice.set(this.lang.translate('admin.pages.settings.uploadingNotice'));

    this.uploadsApi.uploadImage(file, 'branding', 1200).subscribe({
      next: (result) => {
        this.saveDraftLogo(result.url, this.lang.translate('admin.pages.settings.uploadedNotice'));
        if (input) {
          input.value = '';
        }
      },
      error: () => {
        this.uploading.set(false);
        this.notice.set(this.lang.translate('admin.pages.settings.uploadError'));
      },
    });
  }

  useExistingAsset(asset: CmsMediaAsset): void {
    this.saveDraftLogo(asset.url, this.lang.translate('admin.pages.settings.assetAppliedNotice'));
  }

  publishLogo(): void {
    if (!this.draftLogo() || this.publishing()) {
      return;
    }

    this.publishing.set(true);
    this.notice.set(this.lang.translate('admin.pages.settings.publishingNotice'));

    this.cmsApi.publishSettings('brand.logo').subscribe({
      next: () => {
        this.publishing.set(false);
        this.publishedLogo.set(this.draftLogo());
        this.siteSettings.setValue('brand.logo', this.draftLogo());
        this.siteSettings.refresh();
        this.notice.set(this.lang.translate('admin.pages.settings.publishedNotice'));
      },
      error: () => {
        this.publishing.set(false);
        this.notice.set(this.lang.translate('admin.pages.settings.publishError'));
      },
    });
  }

  formatSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  resolveImageSrc(url: string): string {
    return resolveAssetUrl(url || this.fallbackLogo);
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;

    if (!image || image.dataset['fallbackApplied'] === 'true') {
      return;
    }

    image.dataset['fallbackApplied'] = 'true';
    image.src = this.fallbackLogo;
  }

  private loadData(): void {
    forkJoin({
      draftSettings: this.cmsApi.getSettings('draft'),
      publishedSettings: this.cmsApi.getSettings('published'),
      media: this.cmsApi.getMedia(),
    }).subscribe({
      next: ({ draftSettings, publishedSettings, media }) => {
        this.draftLogo.set(this.findSettingValue(draftSettings, 'brand.logo') || this.fallbackLogo);
        this.publishedLogo.set(
          this.findSettingValue(publishedSettings, 'brand.logo') || this.fallbackLogo,
        );
        this.media.set(media);
      },
      error: () => {
        this.notice.set(this.lang.translate('admin.pages.settings.loadError'));
      },
    });
  }

  private saveDraftLogo(url: string, successMessage: string): void {
    const storedUrl = toStoredAssetUrl(url);
    this.draftLogo.set(storedUrl);

    this.cmsApi
      .upsertSetting({
        key: 'brand.logo',
        type: 'image',
        value: storedUrl,
      })
      .subscribe({
        next: () => {
          this.uploading.set(false);
          this.notice.set(successMessage);
          this.loadData();
        },
        error: () => {
          this.uploading.set(false);
          this.notice.set(this.lang.translate('admin.pages.settings.saveDraftError'));
        },
      });
  }

  private findSettingValue(settings: CmsSiteSetting[], key: string): string {
    return settings.find((setting) => setting.key === key)?.value ?? '';
  }
}
