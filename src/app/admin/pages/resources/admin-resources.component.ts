import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { CategoriesApiService } from '../../../core/services/categories-api.service';
import { MilestonesApiService } from '../../../core/services/milestones-api.service';
import { RegionsApiService } from '../../../core/services/regions-api.service';
import { StaticPagesApiService } from '../../../core/services/static-pages-api.service';
import { StatsApiService } from '../../../core/services/stats-api.service';
import { UploadsApiService } from '../../../core/services/uploads-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { resolveAssetUrl, toStoredAssetUrl } from '../../../core/utils/asset-url.util';

type ResourceKey = 'categories' | 'regions' | 'milestones' | 'stats' | 'pages';
type LocaleKey = 'en' | 'ar';

@Component({
  selector: 'app-admin-resources',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow">{{ eyebrow() }}</span>
          <h2>{{ heading() }}</h2>
        </div>
      </div>

      <div class="tabs" *ngIf="!lockedResource()">
        <button
          type="button"
          *ngFor="let item of visibleResourceKeys()"
          [class.active]="active() === item"
          (click)="switchResource(item)"
        >
          {{ resourceLabel(item) }}
        </button>
      </div>

      <div class="layout">
        <form class="panel" [formGroup]="form" (ngSubmit)="save()">
          <h3>
            {{ editing() ? lang.translate('admin.common.edit') : lang.translate('admin.common.create') }}
            {{ resourceLabel(active()) }}
          </h3>

          <div class="grid">
            <input
              formControlName="slug"
              [placeholder]="lang.translate('admin.pages.resources.fields.slug')"
              [readonly]="active() === 'pages' && !!editing()"
            />
            <input formControlName="nameEn" [placeholder]="lang.translate('admin.pages.resources.fields.nameEn')" />
            <input formControlName="nameAr" [placeholder]="lang.translate('admin.pages.resources.fields.nameAr')" />
            <input
              formControlName="descriptionEn"
              [placeholder]="lang.translate('admin.pages.resources.fields.descriptionEn')"
            />
            <input
              formControlName="descriptionAr"
              [placeholder]="lang.translate('admin.pages.resources.fields.descriptionAr')"
            />
            <input formControlName="icon" [placeholder]="lang.translate('admin.pages.resources.fields.icon')" />
            <input formControlName="value" [placeholder]="lang.translate('admin.pages.resources.fields.value')" />
            <input formControlName="unit" [placeholder]="lang.translate('admin.pages.resources.fields.unit')" />
            <input
              formControlName="latitude"
              type="number"
              [placeholder]="lang.translate('admin.pages.resources.fields.latitude')"
            />
            <input
              formControlName="longitude"
              type="number"
              [placeholder]="lang.translate('admin.pages.resources.fields.longitude')"
            />
            <input formControlName="year" type="number" [placeholder]="lang.translate('admin.pages.resources.fields.year')" />
            <input
              formControlName="sortOrder"
              type="number"
              [placeholder]="lang.translate('admin.pages.resources.fields.sortOrder')"
            />
          </div>

          <div class="upload-field" *ngIf="active() === 'regions'">
            <span>{{ lang.translate('admin.pages.resources.regionImage') }}</span>
            <div class="upload-row">
              <input
                type="file"
                accept="image/*"
                (change)="onRegionImageSelected($event)"
                #regionImageInput
                hidden
              />
              <button
                type="button"
                class="ghost"
                (click)="regionImageInput.value = ''; regionImageInput.click()"
                [disabled]="isUploadingRegionImage()"
              >
                {{
                  isUploadingRegionImage()
                    ? lang.translate('admin.pages.resources.uploadingImage')
                    : regionImageName() ||
                      (form.value.imageUrl
                        ? lang.translate('admin.pages.resources.changeImage')
                        : lang.translate('admin.pages.resources.uploadImage'))
                }}
              </button>
              <small>
                {{
                  regionImageName()
                    ? lang.translate('admin.pages.resources.selectedImageHelp')
                    : lang.translate('admin.pages.resources.uploadImageHelp')
                }}
              </small>
            </div>
            <img
              *ngIf="regionPreviewUrl() || form.value.imageUrl"
              class="upload-preview"
              [src]="regionPreviewUrl() || form.value.imageUrl || ''"
              [alt]="lang.translate('admin.pages.resources.regionPreviewAlt')"
            />
          </div>

          <label class="check" *ngIf="active() === 'categories' || active() === 'regions'">
            <input type="checkbox" formControlName="isActive" />
            {{ lang.translate('admin.common.active') }}
          </label>

          <div class="actions">
            <button type="submit" [disabled]="isSubmitDisabled()">
              {{ lang.translate('admin.common.save') }}
            </button>
            <button type="button" class="ghost" (click)="reset()">
              {{ lang.translate('admin.common.clear') }}
            </button>
          </div>
        </form>

        <div class="panel list resource-list">
          <div class="list-head">
            <div>
              <strong>{{ resourceLabel(active()) }}</strong>
              <small>{{ items().length }} item{{ items().length === 1 ? '' : 's' }}</small>
            </div>
          </div>

          <p class="empty-state" *ngIf="items().length === 0">No {{ resourceLabel(active()) }} found.</p>

          <article
            class="resource-card"
            *ngFor="let item of items()"
            [class.inactive]="isInactive(item)"
          >
            <div class="resource-media" *ngIf="active() === 'regions' && imageUrl(item)">
              <img [src]="imageUrl(item)" [alt]="itemTitle(item)" />
            </div>

            <div class="resource-body">
              <div class="resource-top">
                <span class="resource-icon" *ngIf="iconText(item)">{{ iconText(item) }}</span>
                <div class="resource-title">
                  <strong>{{ itemTitle(item) }}</strong>
                  <small>{{ itemMeta(item) }}</small>
                </div>
              </div>

              <p class="resource-description" *ngIf="itemDescription(item)">
                {{ itemDescription(item) }}
              </p>

              <div class="arabic-preview" *ngIf="itemSecondaryText(item)">
                {{ itemSecondaryText(item) }}
              </div>

              <div class="detail-grid">
                <span class="detail-chip" *ngFor="let detail of itemDetails(item)">
                  <b>{{ detail.label }}</b>
                  {{ detail.value }}
                </span>
              </div>
            </div>

            <div class="card-actions">
              <button type="button" (click)="edit(item)">{{ lang.translate('admin.common.edit') }}</button>
              <button type="button" class="danger" (click)="remove(item.id)">
                {{ lang.translate('admin.common.delete') }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .page,
      form,
      .list {
        display: grid;
        gap: 14px;
      }

      .page-head,
      .actions,
      .tabs {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .page-head {
        justify-content: space-between;
        align-items: center;
      }

      .eyebrow {
        color: var(--color-primary);
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      h2,
      h3,
      small {
        margin: 0;
      }

      h2,
      h3,
      strong {
        color: var(--text-primary);
      }

      small {
        color: var(--text-secondary);
      }

      .tabs button,
      button {
        border: 0;
        border-radius: 6px;
        padding: 10px 13px;
        background: var(--border-color);
        color: var(--text-primary);
        font-weight: 800;
        cursor: pointer;
      }

      button[type='submit'],
      .tabs button.active {
        background: var(--color-primary);
        color: #fff;
      }

      .danger {
        background: #d32f2f;
        color: #fff;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(340px, 0.9fr);
        gap: 16px;
      }

      .panel {
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        border-radius: 8px;
        padding: 18px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      input {
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-primary);
        border-radius: 6px;
        padding: 11px 12px;
        font: inherit;
      }

      .upload-field {
        display: grid;
        gap: 10px;
      }

      .upload-field span,
      .upload-field small {
        color: var(--text-secondary);
      }

      .upload-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .upload-preview {
        width: 100%;
        max-width: 220px;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }

      .check {
        color: var(--text-primary);
      }

      .resource-list {
        align-content: start;
        gap: 12px;
      }

      .list-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 12px;
      }

      .list-head > div,
      .resource-title {
        display: grid;
        gap: 3px;
      }

      .empty-state {
        margin: 0;
        color: var(--text-secondary);
        border: 1px dashed var(--border-color);
        border-radius: 8px;
        padding: 18px;
      }

      .resource-card {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: 14px;
        align-items: start;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        border-radius: 8px;
        padding: 14px;
      }

      .resource-card.inactive {
        opacity: 0.62;
      }

      .resource-media {
        width: 92px;
        aspect-ratio: 4 / 3;
        border-radius: 7px;
        overflow: hidden;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
      }

      .resource-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .resource-body {
        min-width: 0;
        display: grid;
        gap: 10px;
      }

      .resource-top {
        display: flex;
        gap: 10px;
        align-items: start;
        min-width: 0;
      }

      .resource-icon {
        width: 34px;
        height: 34px;
        display: inline-grid;
        place-items: center;
        border-radius: 7px;
        color: var(--color-primary);
        background: color-mix(in srgb, var(--color-primary) 14%, transparent);
        border: 1px solid color-mix(in srgb, var(--color-primary) 28%, transparent);
        font-weight: 900;
        flex: 0 0 auto;
      }

      .resource-title strong,
      .resource-title small,
      .resource-description,
      .arabic-preview {
        overflow-wrap: anywhere;
      }

      .resource-description {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .arabic-preview {
        color: var(--text-secondary);
        font-size: 0.88rem;
        padding-inline-start: 10px;
        border-inline-start: 2px solid var(--border-color);
      }

      .detail-grid {
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
      }

      .detail-chip {
        display: inline-flex;
        gap: 5px;
        align-items: center;
        border: 1px solid var(--border-color);
        border-radius: 999px;
        padding: 5px 9px;
        color: var(--text-secondary);
        background: var(--card-bg);
        font-size: 0.82rem;
      }

      .detail-chip b {
        color: var(--text-primary);
      }

      .card-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      @media (max-width: 1050px) {
        .layout,
        .grid {
          grid-template-columns: 1fr;
        }

        .resource-card {
          grid-template-columns: 1fr;
        }

        .card-actions {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class AdminResourcesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly categoriesApi = inject(CategoriesApiService);
  private readonly regionsApi = inject(RegionsApiService);
  private readonly milestonesApi = inject(MilestonesApiService);
  private readonly statsApi = inject(StatsApiService);
  private readonly pagesApi = inject(StaticPagesApiService);
  private readonly uploadsApi = inject(UploadsApiService);
  readonly lang = inject(LanguageService);

  readonly resourceKeys: ResourceKey[] = ['categories', 'regions', 'milestones', 'stats', 'pages'];

  readonly active = signal<ResourceKey>('categories');
  readonly items = signal<any[]>([]);
  readonly editing = signal<any | null>(null);
  readonly lockedResource = signal<ResourceKey | null>(null);
  readonly regionPreviewUrl = signal<string | null>(null);
  readonly regionImageName = signal('');
  readonly isUploadingRegionImage = signal(false);
  readonly visibleResourceKeys = computed(() => {
    const locked = this.lockedResource();
    return locked ? [locked] : this.resourceKeys;
  });
  readonly eyebrow = computed(() =>
    this.lockedResource() === 'categories'
      ? this.lang.translate('admin.pages.resources.categoriesEyebrow')
      : this.lang.translate('admin.pages.resources.eyebrow'),
  );
  readonly heading = computed(() =>
    this.lockedResource() === 'categories'
      ? this.lang.translate('admin.pages.resources.categoriesTitle')
      : this.lang.translate('admin.pages.resources.title'),
  );

  readonly form = this.fb.group({
    slug: [''],
    nameEn: ['', Validators.required],
    nameAr: [''],
    descriptionEn: [''],
    descriptionAr: [''],
    icon: [''],
    value: [''],
    unit: [''],
    imageUrl: [''],
    latitude: [null as number | null],
    longitude: [null as number | null],
    year: [new Date().getFullYear()],
    sortOrder: [0],
    isActive: [true],
  });

  ngOnInit(): void {
    const routeResource = this.route.snapshot.data['resource'] as ResourceKey | undefined;
    if (routeResource) {
      this.lockedResource.set(routeResource);
      this.active.set(routeResource);
    }

    this.load();
  }

  switchResource(resource: ResourceKey): void {
    if (this.lockedResource()) {
      return;
    }

    this.active.set(resource);
    this.reset();
    this.load();
  }

  load(): void {
    const resource = this.active();
    const handler = {
      categories: () => this.categoriesApi.getAdminCategories(),
      regions: () => this.regionsApi.getAdminRegions(),
      milestones: () => this.milestonesApi.getAdminMilestones(),
      stats: () => this.statsApi.getAdminStats(),
      pages: () => this.pagesApi.getAdminPages(),
    }[resource];

    (handler() as any).subscribe({
      next: (items: any[]) => this.items.set(items),
      error: (error: unknown) => console.error(`Failed to load ${resource}`, error),
    });
  }

  save(): void {
    if (this.isSubmitDisabled()) {
      return;
    }

    if (this.active() === 'regions' && this.selectedRegionImage) {
      this.isUploadingRegionImage.set(true);
      this.uploadsApi.uploadImage(this.selectedRegionImage, 'regions').subscribe({
        next: (response) => {
          this.form.patchValue({ imageUrl: response.url });
          this.commitSave(() => this.isUploadingRegionImage.set(false));
        },
        error: (error: unknown) => {
          this.isUploadingRegionImage.set(false);
          console.error('Failed to upload region image', error);
        },
      });
      return;
    }

    this.commitSave();
  }

  isSubmitDisabled(): boolean {
    return this.isUploadingRegionImage() || !this.isFormReadyToSubmit();
  }

  edit(item: any): void {
    this.editing.set(item);
    this.clearRegionImageSelection();
    this.form.patchValue({
      slug: item.slug ?? item.key ?? '',
      nameEn: item.name?.en ?? item.title?.en ?? item.label?.en ?? '',
      nameAr: item.name?.ar ?? item.title?.ar ?? item.label?.ar ?? '',
      descriptionEn: item.description?.en ?? item.body?.en ?? '',
      descriptionAr: item.description?.ar ?? item.body?.ar ?? '',
      icon: item.icon ?? '',
      value: item.value ?? '',
      unit: item.unit ?? '',
      imageUrl: item.imageUrl ?? '',
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      year: item.year ?? new Date().getFullYear(),
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive ?? true,
    });
  }

  reset(): void {
    this.editing.set(null);
    this.clearRegionImageSelection();
    this.form.reset({
      year: new Date().getFullYear(),
      sortOrder: 0,
      isActive: true,
    });
  }

  remove(id: number): void {
    if (!confirm(this.lang.translate('admin.pages.resources.deleteConfirm'))) {
      return;
    }

    const resource = this.active();
    const request = {
      categories: () => this.categoriesApi.deleteCategory(id),
      regions: () => this.regionsApi.deleteRegion(id),
      milestones: () => this.milestonesApi.deleteMilestone(id),
      stats: () => this.statsApi.deleteStat(id),
      pages: () => this.pagesApi.deletePage(id),
    }[resource]();

    request.subscribe({
      next: () => this.load(),
      error: (error) => console.error(`Failed to delete ${resource}`, error),
    });
  }

  resourceLabel(resource: ResourceKey): string {
    return this.lang.translate(`admin.pages.resources.labels.${resource}`);
  }

  itemTitle(item: any): string {
    return (
      this.localizedField(item, this.titleField(), this.lang.currentLang()) ||
      this.localizedField(item, this.titleField(), 'en') ||
      this.localizedField(item, this.titleField(), 'ar') ||
      item.slug ||
      item.key ||
      String(item.year ?? item.id)
    );
  }

  itemSecondaryText(item: any): string {
    const otherLocale: LocaleKey = this.lang.currentLang() === 'ar' ? 'en' : 'ar';
    const secondary = this.localizedField(item, this.titleField(), otherLocale);
    return secondary && secondary !== this.itemTitle(item) ? secondary : '';
  }

  itemDescription(item: any): string {
    const field = this.active() === 'pages' ? 'body' : 'description';
    return (
      this.truncate(
        this.localizedField(item, field, this.lang.currentLang()) ||
          this.localizedField(item, field, 'en') ||
          this.localizedField(item, field, 'ar'),
        this.active() === 'pages' ? 160 : 120,
      ) || ''
    );
  }

  itemMeta(item: any): string {
    switch (this.active()) {
      case 'stats':
        return item.key ? `key: ${item.key}` : `#${item.id}`;
      case 'milestones':
        return item.year ? `year: ${item.year}` : `#${item.id}`;
      default:
        return item.slug ? `/${item.slug}` : `#${item.id}`;
    }
  }

  itemDetails(item: any): Array<{ label: string; value: string }> {
    switch (this.active()) {
      case 'categories':
        return [
          { label: 'Products', value: String(item.productCount ?? 0) },
          { label: 'Order', value: String(item.sortOrder ?? 0) },
          { label: 'Status', value: item.isActive === false ? 'Inactive' : 'Active' },
        ];
      case 'regions':
        return [
          { label: 'Lat', value: String(item.latitude ?? 0) },
          { label: 'Lng', value: String(item.longitude ?? 0) },
          { label: 'Order', value: String(item.sortOrder ?? 0) },
          { label: 'Status', value: item.isActive === false ? 'Inactive' : 'Active' },
        ];
      case 'milestones':
        return [
          { label: 'Year', value: String(item.year ?? '') },
          { label: 'Order', value: String(item.sortOrder ?? 0) },
        ].filter((detail) => detail.value);
      case 'stats':
        return [
          { label: 'Value', value: `${item.value ?? ''}${item.unit ?? ''}` },
          { label: 'Icon', value: item.icon || '-' },
          { label: 'Order', value: String(item.sortOrder ?? 0) },
        ];
      case 'pages':
        return [{ label: 'Slug', value: item.slug || '-' }];
    }
  }

  iconText(item: any): string {
    if (this.active() === 'categories') {
      return item.icon ? String(item.icon).slice(0, 2).toUpperCase() : 'C';
    }

    if (this.active() === 'stats') {
      return item.icon ? String(item.icon).slice(0, 2).toUpperCase() : '#';
    }

    if (this.active() === 'milestones') {
      return String(item.year ?? '').slice(-2) || 'M';
    }

    if (this.active() === 'pages') {
      return 'P';
    }

    return '';
  }

  imageUrl(item: any): string {
    return resolveAssetUrl(item.imageUrl);
  }

  isInactive(item: any): boolean {
    return item.isActive === false;
  }

  onRegionImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    this.selectedRegionImage = file;
    this.regionImageName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => this.regionPreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  private selectedRegionImage: File | null = null;

  private commitSave(onComplete?: () => void): void {
    const request = this.buildSaveRequest();
    (request as any)
      .pipe(finalize(() => onComplete?.()))
      .subscribe({
        next: () => {
          this.reset();
          this.load();
        },
        error: (error: unknown) => console.error(`Failed to save ${this.active()}`, error),
      });
  }

  private clearRegionImageSelection(): void {
    this.selectedRegionImage = null;
    this.regionImageName.set('');
    this.regionPreviewUrl.set(null);
  }

  private isFormReadyToSubmit(): boolean {
    switch (this.active()) {
      case 'categories':
      case 'regions':
        return this.hasText('nameEn');
      case 'milestones':
        return this.hasText('nameEn') && this.form.value.year !== null && this.form.value.year !== undefined;
      case 'stats':
        return this.hasText('slug') && this.hasText('nameEn') && this.hasText('value');
      case 'pages':
        return this.hasText('slug') && this.hasText('nameEn') && this.hasText('descriptionEn');
    }
  }

  private hasText(controlName: keyof typeof this.form.controls): boolean {
    const value = this.form.get(controlName)?.value;
    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  }

  private titleField(): 'name' | 'title' | 'label' {
    switch (this.active()) {
      case 'milestones':
      case 'pages':
        return 'title';
      case 'stats':
        return 'label';
      default:
        return 'name';
    }
  }

  private localizedField(item: any, field: string, locale: LocaleKey): string {
    const value = item?.[field];

    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value.trim();
    }

    return typeof value[locale] === 'string' ? value[locale].trim() : '';
  }

  private truncate(value: string, maxLength: number): string {
    const normalized = value.trim();

    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trim()}...`;
  }

  private buildSaveRequest() {
    const value = this.form.getRawValue();
    const localizedName = { en: value.nameEn ?? '', ar: value.nameAr ?? '' };
    const localizedDescription = {
      en: value.descriptionEn ?? '',
      ar: value.descriptionAr ?? '',
    };
    const id = this.editing()?.id;

    switch (this.active()) {
      case 'categories': {
        const payload = {
          slug: value.slug ?? '',
          name: localizedName,
          description: localizedDescription,
          icon: value.icon ?? '',
          sortOrder: value.sortOrder ?? 0,
          isActive: Boolean(value.isActive),
        };
        return id ? this.categoriesApi.updateCategory(id, payload) : this.categoriesApi.createCategory(payload);
      }
      case 'regions': {
        const payload = {
          slug: value.slug ?? '',
          name: localizedName,
          description: localizedDescription,
          latitude: Number(value.latitude ?? 0),
          longitude: Number(value.longitude ?? 0),
          imageUrl: toStoredAssetUrl(value.imageUrl ?? ''),
          sortOrder: value.sortOrder ?? 0,
          isActive: Boolean(value.isActive),
        };
        return id ? this.regionsApi.updateRegion(id, payload) : this.regionsApi.createRegion(payload);
      }
      case 'milestones': {
        const payload = {
          year: value.year ?? new Date().getFullYear(),
          title: localizedName,
          description: localizedDescription,
          sortOrder: value.sortOrder ?? 0,
        };
        return id
          ? this.milestonesApi.updateMilestone(id, payload)
          : this.milestonesApi.createMilestone(payload);
      }
      case 'stats': {
        const payload = {
          key: value.slug ?? '',
          label: localizedName,
          value: value.value ?? '',
          unit: value.unit ?? '',
          icon: value.icon ?? '',
          sortOrder: value.sortOrder ?? 0,
        };
        return id ? this.statsApi.updateStat(id, payload) : this.statsApi.createStat(payload);
      }
      case 'pages': {
        return this.pagesApi.upsertPage({
          slug: value.slug ?? '',
          title: localizedName,
          body: localizedDescription,
        });
      }
    }
  }
}
