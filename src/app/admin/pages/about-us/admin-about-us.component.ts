import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  ABOUT_PAGE_SETTING_KEY,
  AboutPageContent,
  AboutPageSection,
  cloneAboutPageContent,
  createAboutPageSection,
  parseAboutPageContent,
} from '../../../core/models/about-page.model';
import { CmsSiteSetting } from '../../../core/models/cms.model';
import { CmsApiService } from '../../../core/services/cms-api.service';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { UploadsApiService } from '../../../core/services/uploads-api.service';
import { resolveAssetUrl, toStoredAssetUrl } from '../../../core/utils/asset-url.util';

type EditableLocale = 'en' | 'ar';
type SectionField = 'navLabel' | 'title' | 'body';
type HeroField = 'heroTitle' | 'heroSubtitle';

@Component({
  selector: 'app-admin-about-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-grid">
      <div class="hero-card">
        <div>
          <span class="eyebrow">About Us</span>
          <h2>About Us Page Manager</h2>
          <p>
            Build a dedicated About Us page with a custom header, flexible sections, and
            background images managed directly from the dashboard.
          </p>
        </div>

        <div class="hero-actions">
          <div class="locale-toggle">
            <button
              type="button"
              class="ghost"
              (click)="setLocale('en')"
              [class.active]="locale() === 'en'"
            >
              EN
            </button>
            <button
              type="button"
              class="ghost"
              (click)="setLocale('ar')"
              [class.active]="locale() === 'ar'"
            >
              AR
            </button>
          </div>

          <button
            type="button"
            class="ghost"
            (click)="saveDraft()"
            [disabled]="saving() || publishing()"
          >
            {{ saving() ? 'Saving...' : 'Save Draft' }}
          </button>

          <button
            type="button"
            class="primary"
            (click)="publishLive()"
            [disabled]="saving() || publishing()"
          >
            {{ publishing() ? 'Publishing...' : 'Publish Live' }}
          </button>
        </div>
      </div>

      <div class="notice">{{ notice() }}</div>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Page Header</h3>
            <p>This copy appears only on the public About Us page above the section navigation.</p>
          </div>
        </div>

        <div class="field-grid">
          <label class="field">
            <span>Header Title ({{ localeLabel() }})</span>
            <input
              [ngModel]="readHeroField('heroTitle')"
              (ngModelChange)="updateHeroField('heroTitle', $event)"
              type="text"
            />
          </label>

          <label class="field field-wide">
            <span>Header Subtitle ({{ localeLabel() }})</span>
            <textarea
              [ngModel]="readHeroField('heroSubtitle')"
              (ngModelChange)="updateHeroField('heroSubtitle', $event)"
              rows="3"
            ></textarea>
          </label>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Sections</h3>
            <p>
              Each section creates one navigation item in the About Us header and one public block
              with a background image, title, and paragraph.
            </p>
          </div>

          <button type="button" class="secondary" (click)="addSection()">Add Section</button>
        </div>

        <div class="section-stack">
          <article
            class="section-card"
            *ngFor="let section of sections(); let index = index; trackBy: trackBySection"
          >
            <div class="section-card-head">
              <div>
                <span class="section-index">Section {{ index + 1 }}</span>
                <h4>{{ readSectionField(section, 'navLabel') }}</h4>
              </div>

              <div class="section-actions">
                <button
                  type="button"
                  class="icon-btn"
                  (click)="moveSection(index, -1)"
                  [disabled]="index === 0"
                  title="Move section up"
                >
                  Up
                </button>
                <button
                  type="button"
                  class="icon-btn"
                  (click)="moveSection(index, 1)"
                  [disabled]="index === sections().length - 1"
                  title="Move section down"
                >
                  Dn
                </button>
                <button
                  type="button"
                  class="icon-btn danger"
                  (click)="removeSection(index)"
                  [disabled]="sections().length === 1"
                  title="Delete section"
                >
                  Del
                </button>
              </div>
            </div>

            <div class="section-layout">
              <div class="image-panel">
                <div
                  class="image-preview"
                  [style.background-image]="buildPreviewBackground(section.imageUrl)"
                >
                  <span *ngIf="!section.imageUrl">No background image selected</span>
                </div>

                <div class="image-actions">
                  <label class="upload-cta" [class.disabled]="uploadingSectionId() === section.id">
                    <input
                      type="file"
                      accept="image/*"
                      (change)="onSectionImageSelected(index, $event)"
                      [disabled]="uploadingSectionId() === section.id"
                    />
                    <span>
                      {{
                        uploadingSectionId() === section.id
                          ? 'Uploading image...'
                          : 'Upload background'
                      }}
                    </span>
                  </label>

                  <button
                    type="button"
                    class="ghost small"
                    (click)="clearSectionImage(index)"
                    [disabled]="!section.imageUrl"
                  >
                    Clear Image
                  </button>
                </div>

                <label class="field">
                  <span>Background Image URL</span>
                  <input
                    [ngModel]="section.imageUrl"
                    (ngModelChange)="updateSectionImageUrl(index, $event)"
                    type="text"
                    placeholder="/uploads/about-us/example.webp"
                  />
                </label>
              </div>

              <div class="copy-panel">
                <div class="field-grid">
                  <label class="field">
                    <span>Navigation Label ({{ localeLabel() }})</span>
                    <input
                      [ngModel]="readSectionField(section, 'navLabel')"
                      (ngModelChange)="updateSectionField(index, 'navLabel', $event)"
                      type="text"
                    />
                  </label>

                  <label class="field">
                    <span>Section Title ({{ localeLabel() }})</span>
                    <input
                      [ngModel]="readSectionField(section, 'title')"
                      (ngModelChange)="updateSectionField(index, 'title', $event)"
                      type="text"
                    />
                  </label>

                  <label class="field field-wide">
                    <span>Section Paragraph ({{ localeLabel() }})</span>
                    <textarea
                      [ngModel]="readSectionField(section, 'body')"
                      (ngModelChange)="updateSectionField(index, 'body', $event)"
                      rows="5"
                    ></textarea>
                  </label>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      .page-grid {
        display: grid;
        gap: 20px;
      }

      .hero-card,
      .panel,
      .section-card {
        border-radius: 28px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .hero-card {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) auto;
        gap: 20px;
        padding: 28px;
        background:
          radial-gradient(circle at top right, rgba(13, 92, 171, 0.12), transparent 24%),
          radial-gradient(circle at left center, rgba(255, 202, 40, 0.12), transparent 30%),
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
      h4,
      p {
        margin: 0;
      }

      h2,
      h3,
      h4 {
        color: var(--text-primary);
      }

      .hero-card p,
      .panel-head p,
      .notice,
      .field span,
      .section-index,
      .image-preview span {
        color: var(--text-secondary);
      }

      .hero-card p {
        margin-top: 10px;
        max-width: 760px;
        line-height: 1.75;
      }

      .hero-actions {
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 10px;
      }

      .locale-toggle {
        display: flex;
        gap: 8px;
      }

      .notice {
        min-height: 24px;
      }

      .panel {
        padding: 22px;
      }

      .panel-head,
      .section-card-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .panel-head {
        margin-bottom: 18px;
      }

      .section-stack {
        display: grid;
        gap: 16px;
      }

      .section-card {
        padding: 18px;
      }

      .section-index {
        display: inline-block;
        margin-bottom: 6px;
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .section-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .section-layout {
        display: grid;
        grid-template-columns: minmax(300px, 0.9fr) minmax(0, 1.1fr);
        gap: 18px;
        margin-top: 18px;
      }

      .image-panel,
      .copy-panel {
        display: grid;
        gap: 14px;
      }

      .image-preview {
        min-height: 260px;
        border-radius: 22px;
        background-color: rgba(13, 92, 171, 0.08);
        background-size: cover;
        background-position: center;
        border: 1px solid rgba(13, 92, 171, 0.14);
        display: grid;
        place-items: center;
        padding: 18px;
        text-align: center;
      }

      .image-preview span {
        font-weight: 700;
      }

      .image-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .field {
        display: grid;
        gap: 8px;
      }

      .field-wide {
        grid-column: 1 / -1;
      }

      .field span {
        font-size: 0.8rem;
        font-weight: 700;
      }

      input,
      textarea,
      button {
        font: inherit;
      }

      input,
      textarea {
        width: 100%;
        min-height: 48px;
        border-radius: 14px;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-primary);
        padding: 12px 14px;
        resize: vertical;
        transition:
          border-color 0.25s ease,
          background 0.25s ease;
      }

      textarea {
        min-height: 118px;
      }

      input:focus,
      textarea:focus {
        outline: none;
        border-color: rgba(245, 124, 0, 0.45);
        background: var(--card-bg);
      }

      .ghost,
      .primary,
      .secondary,
      .icon-btn,
      .upload-cta {
        border: none;
        border-radius: 16px;
        padding: 12px 16px;
        cursor: pointer;
        transition:
          transform 0.25s ease,
          border-color 0.25s ease,
          background 0.25s ease,
          color 0.25s ease;
      }

      .ghost,
      .secondary,
      .icon-btn {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
      }

      .ghost.active {
        color: var(--color-primary);
        border-color: rgba(245, 124, 0, 0.38);
        background: rgba(245, 124, 0, 0.08);
      }

      .ghost:hover,
      .secondary:hover,
      .icon-btn:hover {
        transform: translateY(-1px);
        border-color: rgba(245, 124, 0, 0.34);
      }

      .primary {
        color: #fff;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      }

      .primary:hover,
      .secondary:hover {
        transform: translateY(-1px);
      }

      .secondary {
        background: rgba(13, 92, 171, 0.1);
        border-color: rgba(13, 92, 171, 0.18);
      }

      .icon-btn {
        min-width: 46px;
        padding-inline: 12px;
      }

      .icon-btn.danger {
        color: #d6455d;
      }

      .small {
        min-height: 48px;
      }

      .upload-cta {
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed rgba(13, 92, 171, 0.38);
        background: rgba(13, 92, 171, 0.07);
        color: var(--text-primary);
        min-height: 48px;
      }

      .upload-cta input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }

      .upload-cta.disabled,
      button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      @media (max-width: 1080px) {
        .hero-card,
        .section-layout {
          grid-template-columns: 1fr;
        }

        .hero-actions {
          justify-content: flex-start;
        }
      }

      @media (max-width: 720px) {
        .field-grid {
          grid-template-columns: 1fr;
        }

        .hero-card,
        .panel,
        .section-card {
          border-radius: 22px;
        }

        .section-card-head,
        .panel-head {
          display: grid;
        }

        .section-actions {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class AdminAboutUsComponent implements OnInit {
  private readonly cmsApi = inject(CmsApiService);
  private readonly uploadsApi = inject(UploadsApiService);
  private readonly siteSettings = inject(SiteSettingsService);

  readonly locale = signal<EditableLocale>('en');
  readonly draftContent = signal<AboutPageContent>(cloneAboutPageContent());
  readonly saving = signal(false);
  readonly publishing = signal(false);
  readonly uploadingSectionId = signal<string | null>(null);
  readonly notice = signal(
    'Manage the About Us page structure here. Saving stores a draft, while publishing updates the live page.',
  );

  readonly sections = computed(() => this.draftContent().sections);

  ngOnInit(): void {
    this.loadData();
  }

  localeLabel(): string {
    return this.locale() === 'en' ? 'EN' : 'AR';
  }

  setLocale(locale: EditableLocale): void {
    this.locale.set(locale);
  }

  trackBySection(_: number, section: AboutPageSection): string {
    return section.id;
  }

  readHeroField(field: HeroField): string {
    return this.draftContent()[field][this.locale()];
  }

  updateHeroField(field: HeroField, value: string): void {
    const next = cloneAboutPageContent(this.draftContent());
    next[field][this.locale()] = value;
    this.draftContent.set(next);
  }

  readSectionField(section: AboutPageSection, field: SectionField): string {
    return section[field][this.locale()];
  }

  updateSectionField(index: number, field: SectionField, value: string): void {
    const next = cloneAboutPageContent(this.draftContent());
    next.sections[index][field][this.locale()] = value;
    this.draftContent.set(next);
  }

  updateSectionImageUrl(index: number, value: string): void {
    const next = cloneAboutPageContent(this.draftContent());
    next.sections[index].imageUrl = toStoredAssetUrl(value);
    this.draftContent.set(next);
  }

  clearSectionImage(index: number): void {
    const next = cloneAboutPageContent(this.draftContent());
    next.sections[index].imageUrl = '';
    this.draftContent.set(next);
  }

  addSection(): void {
    const next = cloneAboutPageContent(this.draftContent());
    next.sections.push(createAboutPageSection(next.sections.length));
    this.draftContent.set(next);
  }

  removeSection(index: number): void {
    if (this.sections().length === 1) {
      this.notice.set('At least one About Us section is required.');
      return;
    }

    const next = cloneAboutPageContent(this.draftContent());
    next.sections.splice(index, 1);
    this.draftContent.set(next);
  }

  moveSection(index: number, direction: -1 | 1): void {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= this.sections().length) {
      return;
    }

    const next = cloneAboutPageContent(this.draftContent());
    const [section] = next.sections.splice(index, 1);
    next.sections.splice(targetIndex, 0, section);
    this.draftContent.set(next);
  }

  onSectionImageSelected(index: number, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    const section = this.sections()[index];

    if (!file || !section) {
      return;
    }

    this.uploadingSectionId.set(section.id);
    this.notice.set(`Uploading background image for section ${index + 1}...`);

    this.uploadsApi.uploadImage(file, 'about-us', 2200).subscribe({
      next: (result) => {
        this.updateSectionImageUrl(index, result.url);
        this.uploadingSectionId.set(null);
        this.notice.set(`Background image uploaded for section ${index + 1}.`);

        if (input) {
          input.value = '';
        }
      },
      error: () => {
        this.uploadingSectionId.set(null);
        this.notice.set('Could not upload the selected background image.');
      },
    });
  }

  saveDraft(): void {
    if (this.saving() || this.publishing()) {
      return;
    }

    this.saving.set(true);
    this.notice.set('Saving About Us draft...');

    this.cmsApi
      .upsertSetting({
        key: ABOUT_PAGE_SETTING_KEY,
        type: 'json',
        value: JSON.stringify(this.draftContent()),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notice.set('About Us draft saved successfully.');
        },
        error: () => {
          this.saving.set(false);
          this.notice.set('Could not save the About Us draft right now.');
        },
      });
  }

  publishLive(): void {
    if (this.publishing()) {
      return;
    }

    this.publishing.set(true);
    this.notice.set('Saving and publishing the About Us page...');

    this.cmsApi
      .upsertSetting({
        key: ABOUT_PAGE_SETTING_KEY,
        type: 'json',
        value: JSON.stringify(this.draftContent()),
      })
      .subscribe({
        next: () => {
          this.cmsApi.publishSettings(ABOUT_PAGE_SETTING_KEY).subscribe({
            next: () => {
              this.siteSettings.refresh();
              this.publishing.set(false);
              this.notice.set('The About Us page is now live.');
            },
            error: () => {
              this.publishing.set(false);
              this.notice.set('The draft was saved, but live publishing failed.');
            },
          });
        },
        error: () => {
          this.publishing.set(false);
          this.notice.set('Could not save the current About Us draft before publishing.');
        },
      });
  }

  buildPreviewBackground(imageUrl: string): string {
    const resolvedImage = resolveAssetUrl(imageUrl);

    if (!resolvedImage) {
      return `
        radial-gradient(circle at top right, rgba(255, 202, 40, 0.22), transparent 24%),
        linear-gradient(135deg, rgba(13, 92, 171, 0.18), rgba(13, 92, 171, 0.74))
      `;
    }

    return `
      linear-gradient(180deg, rgba(8, 25, 45, 0.18), rgba(8, 25, 45, 0.38)),
      url("${resolvedImage}")
    `;
  }

  private loadData(): void {
    forkJoin({
      draftSettings: this.cmsApi.getSettings('draft'),
    }).subscribe({
      next: ({ draftSettings }) => {
        this.draftContent.set(
          parseAboutPageContent(this.findSettingValue(draftSettings, ABOUT_PAGE_SETTING_KEY)),
        );
      },
      error: () => {
        this.notice.set('Could not load saved About Us settings, so local defaults are shown.');
      },
    });
  }

  private findSettingValue(settings: CmsSiteSetting[], key: string): string {
    return settings.find((setting) => setting.key === key)?.value ?? '';
  }
}
