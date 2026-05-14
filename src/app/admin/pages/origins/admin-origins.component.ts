import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OriginsApiService } from '../../../core/services/origins-api.service';
import { OriginApi } from '../../../core/models/origin-api.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-admin-origins',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow">{{ lang.translate('admin.pages.origins.eyebrow') }}</span>
          <h2>{{ lang.translate('admin.pages.origins.title') }}</h2>
          <p>{{ lang.translate('admin.pages.origins.description') }}</p>
        </div>

        <div class="head-actions">
          <button type="button" class="secondary" (click)="loadOrigins()">
            {{ lang.translate('admin.pages.origins.syncCards') }}
          </button>
          <button type="button" (click)="openCreate()">
            {{ lang.translate('admin.pages.origins.addOrigin') }}
          </button>
        </div>
      </div>

      <form class="editor" *ngIf="mode()" [formGroup]="originForm" (ngSubmit)="saveOrigin()">
        <input
          formControlName="id"
          [placeholder]="lang.translate('admin.pages.origins.fields.code')"
          [readonly]="mode() === 'edit'"
        />
        <input
          formControlName="country"
          [placeholder]="lang.translate('admin.pages.origins.fields.countryEn')"
        />
        <input
          formControlName="country_ar"
          [placeholder]="lang.translate('admin.pages.origins.fields.countryAr')"
        />
        <input
          formControlName="latitude"
          type="number"
          step="any"
          [placeholder]="lang.translate('admin.pages.resources.fields.latitude')"
        />
        <input
          formControlName="longitude"
          type="number"
          step="any"
          [placeholder]="lang.translate('admin.pages.resources.fields.longitude')"
        />

        <button type="submit" [disabled]="originForm.invalid">
          {{
            mode() === 'create'
              ? lang.translate('admin.pages.origins.createOrigin')
              : lang.translate('admin.pages.origins.updateOrigin')
          }}
        </button>
        <button type="button" class="secondary" (click)="cancelEdit()">
          {{ lang.translate('admin.common.cancel') }}
        </button>
      </form>

      <div *ngIf="loading()" class="loading-state">
        <p>{{ lang.translate('admin.pages.origins.loading') }}</p>
      </div>

      <div *ngIf="!loading() && origins().length === 0" class="empty-state">
        <p>{{ lang.translate('admin.pages.origins.empty') }}</p>
      </div>

      <div class="origin-grid" *ngIf="!loading() && origins().length > 0">
        <article class="origin-card" *ngFor="let origin of origins()">
          <div class="origin-top">
            <div>
              <span class="origin-id">{{ origin.id }}</span>
              <h3>{{ origin.country }}</h3>
              <p *ngIf="origin.country_ar">{{ origin.country_ar }}</p>
            </div>
          </div>

          <div class="coordinates">
            <div class="coordinate-box">
              <strong>Lat</strong>
              <span>{{ formatCoordinate(origin.latitude) }}</span>
            </div>
            <div class="coordinate-box">
              <strong>Lng</strong>
              <span>{{ formatCoordinate(origin.longitude) }}</span>
            </div>
          </div>

          <div class="products" *ngIf="origin.products.length > 0">
            <span class="product-pill" *ngFor="let product of origin.products">{{ product }}</span>
          </div>

          <div class="actions">
            <button type="button" class="secondary" (click)="editOrigin(origin)">
              {{ lang.translate('admin.pages.origins.editCoverage') }}
            </button>
            <button type="button" class="secondary danger" (click)="deleteOrigin(origin)">
              {{ lang.translate('admin.pages.origins.deleteOrigin') }}
            </button>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 20px;
      }

      .page-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 18px;
      }

      .head-actions,
      .actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .eyebrow {
        display: inline-block;
        margin-bottom: 10px;
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

      .page-head p,
      .origin-top p,
      .coordinate-box span,
      .loading-state,
      .empty-state {
        color: var(--text-secondary);
      }

      .loading-state,
      .empty-state {
        padding: 40px;
        text-align: center;
        border: 1px dashed var(--border-color);
        border-radius: 26px;
      }

      button {
        border: none;
        border-radius: 16px;
        padding: 12px 16px;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        transition: all 0.25s ease;
      }

      .page-head button,
      .editor button[type='submit'] {
        color: #fff;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      }

      .page-head button:hover,
      .editor button[type='submit']:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(245, 124, 0, 0.35);
      }

      .secondary {
        color: var(--text-secondary);
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
      }

      .secondary:hover {
        color: var(--text-primary);
        border-color: rgba(245, 124, 0, 0.35);
      }

      .danger:hover {
        border-color: rgba(211, 47, 47, 0.4);
        color: #d32f2f;
      }

      .origin-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .origin-card {
        display: grid;
        gap: 18px;
        padding: 22px;
        border-radius: 26px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .origin-id {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        min-height: 32px;
        padding: 0 12px;
        margin-bottom: 10px;
        border-radius: 999px;
        background: rgba(245, 124, 0, 0.12);
        color: var(--color-primary);
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .origin-top h3,
      .coordinate-box strong {
        color: var(--text-primary);
      }

      .coordinates {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .coordinate-box {
        display: grid;
        gap: 6px;
        padding: 16px;
        border-radius: 18px;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
      }

      .products {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .product-pill {
        padding: 6px 10px;
        border-radius: 999px;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        font-size: 0.78rem;
        line-height: 1.2;
      }

      .editor {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        padding: 18px;
        border: 1px solid var(--border-color);
        border-radius: 18px;
        background: var(--card-bg);
      }

      .editor input {
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-primary);
        border-radius: 12px;
        padding: 12px;
        font: inherit;
      }

      .editor button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      @media (max-width: 1180px) {
        .origin-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .page-head,
        .editor,
        .coordinates {
          display: grid;
        }

        .editor {
          grid-template-columns: 1fr;
        }

        .head-actions {
          width: 100%;
        }

        .head-actions button {
          flex: 1 1 auto;
        }
      }
    `,
  ],
})
export class AdminOriginsComponent implements OnInit {
  private readonly originsApi = inject(OriginsApiService);
  private readonly fb = inject(FormBuilder);
  readonly lang = inject(LanguageService);

  readonly origins = signal<OriginApi[]>([]);
  readonly loading = signal(true);
  readonly editing = signal<OriginApi | null>(null);
  readonly mode = signal<'create' | 'edit' | null>(null);

  readonly originForm = this.fb.group({
    id: ['', Validators.required],
    country: ['', Validators.required],
    country_ar: [''],
    latitude: [null as number | null, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [
      null as number | null,
      [Validators.required, Validators.min(-180), Validators.max(180)],
    ],
  });

  ngOnInit(): void {
    this.loadOrigins();
  }

  loadOrigins(): void {
    this.loading.set(true);
    this.originsApi.getOrigins().subscribe({
      next: (data) => {
        this.origins.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  editOrigin(origin: OriginApi): void {
    this.editing.set(origin);
    this.mode.set('edit');
    this.originForm.patchValue({
      id: origin.id,
      country: origin.country,
      country_ar: origin.country_ar ?? '',
      latitude: origin.latitude ?? null,
      longitude: origin.longitude ?? null,
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.mode.set('create');
    this.originForm.reset({
      id: '',
      country: '',
      country_ar: '',
      latitude: null,
      longitude: null,
    });
  }

  cancelEdit(): void {
    this.editing.set(null);
    this.mode.set(null);
    this.originForm.reset();
  }

  saveOrigin(): void {
    if (!this.mode() || this.originForm.invalid) {
      return;
    }

    const value = this.originForm.getRawValue();
    const payload = {
      country: (value.country ?? '').trim(),
      country_ar: (value.country_ar ?? '').trim(),
      latitude: this.toNullableNumber(value.latitude),
      longitude: this.toNullableNumber(value.longitude),
    };

    const request =
      this.mode() === 'create'
        ? this.originsApi.createOrigin({
            id: (value.id ?? '').trim().toUpperCase(),
            ...payload,
          })
        : this.originsApi.updateOrigin(this.editing()!.id, payload);

    request.subscribe({
      next: () => {
        this.cancelEdit();
        this.loadOrigins();
      },
      error: (error) => console.error('Failed to save origin', error),
    });
  }

  deleteOrigin(origin: OriginApi): void {
    if (!confirm(this.lang.translate('admin.pages.origins.deleteConfirm'))) {
      return;
    }

    this.originsApi.deleteOrigin(origin.id).subscribe({
      next: () => {
        if (this.editing()?.id === origin.id) {
          this.cancelEdit();
        }
        this.loadOrigins();
      },
      error: (error) => console.error('Failed to delete origin', error),
    });
  }

  formatCoordinate(value: number | null | undefined): string {
    return typeof value === 'number' ? value.toFixed(4) : '--';
  }

  private toNullableNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
