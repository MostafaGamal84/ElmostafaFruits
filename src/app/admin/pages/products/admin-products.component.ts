import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PortfolioProductsApiService } from '../../../core/services/portfolio-products-api.service';
import { UploadsApiService } from '../../../core/services/uploads-api.service';
import {
  PortfolioProductApi,
  PortfolioProductPayload,
} from '../../../core/models/portfolio-product.model';
import { finalize } from 'rxjs';
import { toStoredAssetUrl } from '../../../core/utils/asset-url.util';
import { LanguageService } from '../../../core/services/language.service';

interface ShowcaseCategoryOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow">{{ lang.translate('admin.pages.products.eyebrow') }}</span>
          <h2>{{ lang.translate('admin.pages.products.title') }}</h2>
          <p>{{ lang.translate('admin.pages.products.description') }}</p>
        </div>
        <button type="button" (click)="openEditor()">
          + {{ lang.translate('admin.pages.products.addCard') }}
        </button>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <p>{{ lang.translate('admin.pages.products.loading') }}</p>
      </div>

      <ng-container *ngIf="!loading()">
        <div class="summary-strip">
          <div class="summary-item">
            <strong>{{ liveCount() }}</strong>
            <span>{{ lang.translate('admin.pages.products.liveCards') }}</span>
          </div>
          <div class="summary-item">
            <strong>{{ draftCount() }}</strong>
            <span>{{ lang.translate('admin.pages.products.draftCards') }}</span>
          </div>
          <div class="summary-item">
            <strong>{{ products().length }}</strong>
            <span>{{ lang.translate('admin.pages.products.totalCards') }}</span>
          </div>
        </div>

        <div *ngIf="products().length === 0" class="empty-state">
          <p>{{ lang.translate('admin.pages.products.empty') }}</p>
        </div>

        <div class="card-grid" *ngIf="products().length > 0">
          <article class="product-card" *ngFor="let product of products()">
            <img [src]="product.imageUrl" [alt]="product.name" />

            <div class="content">
              <div class="meta">
                <span class="pill" [class.draft]="product.status !== 'Live'">{{
                  statusLabel(product.status)
                }}</span>
                <span class="category">{{ displayCategory(product.category) }}</span>
              </div>

              <h3>{{ product.name }}</h3>
              <p class="origin">{{ product.origin.join(', ') }}</p>

              <div class="multilingual-previews">
                <div class="preview">
                  <span class="label">{{ lang.translate('admin.pages.products.arTitle') }}:</span>
                  <span class="val">
                    {{ product.name_ar || lang.translate('admin.pages.products.notTranslated') }}
                  </span>
                </div>
              </div>

              <div class="footer">
                <small>
                  {{ lang.translate('admin.pages.products.updated') }}
                  {{ product.updatedAt | date: 'mediumDate' }}
                </small>
                <div class="actions">
                  <button type="button" class="secondary" (click)="openEditor(product)">
                    {{ lang.translate('admin.pages.products.editCopy') }}
                  </button>
                  <button
                    type="button"
                    class="secondary delete-btn"
                    (click)="deleteProduct(product.id)"
                  >
                    {{ lang.translate('admin.common.delete') }}
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </ng-container>

      <!-- Glassmorphism Editor Overlay -->
      <div class="editor-overlay" [class.active]="isEditorOpen()">
        <div class="editor-backdrop" (click)="closeEditor()"></div>
        <div class="editor-panel">
          <div class="panel-head">
            <h3>
              {{
                editingProduct()
                  ? lang.translate('admin.pages.products.editProduct')
                  : lang.translate('admin.pages.products.addProduct')
              }}
            </h3>
            <button class="close-btn" (click)="closeEditor()">&times;</button>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="onSave()" class="panel-body">
            <!-- Image Section -->
            <div class="form-group image-upload-group">
              <label>{{ lang.translate('admin.pages.products.productImage') }} *</label>
              <div
                class="image-preview-box"
                [style.backgroundImage]="
                  'url(' + (previewUrl() || productForm.value.imageUrl) + ')'
                "
              >
                <input
                  type="file"
                  (change)="onFileSelected($event)"
                  accept="image/*"
                  #fileInput
                  hidden
                />
                <div
                  class="upload-vibe"
                  *ngIf="!previewUrl() && !productForm.value.imageUrl"
                  (click)="fileInput.click()"
                >
                  <span class="icon">📸</span>
                  <span>{{ lang.translate('admin.pages.products.clickUploadImage') }}</span>
                </div>
                <div
                  class="change-overlay"
                  *ngIf="previewUrl() || productForm.value.imageUrl"
                  (click)="fileInput.click()"
                >
                  <span>{{ lang.translate('admin.pages.products.changeImage') }}</span>
                </div>
              </div>
              <p class="upload-hint">{{ lang.translate('admin.pages.products.uploadHint') }}</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ lang.translate('admin.pages.products.fields.nameEn') }} *</label>
                <input
                  formControlName="name"
                  [placeholder]="lang.translate('admin.pages.products.placeholders.nameEn')"
                />
              </div>
              <div class="form-group">
                <label>{{ lang.translate('admin.pages.products.fields.nameAr') }}</label>
                <input
                  formControlName="name_ar"
                  [placeholder]="lang.translate('admin.pages.products.placeholders.nameAr')"
                  dir="rtl"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ lang.translate('admin.pages.products.fields.category') }} *</label>
                <select formControlName="category">
                  <option *ngFor="let category of showcaseCategories" [value]="category.value">
                    {{ displayCategory(category.value) }}
                  </option>
                </select>
                <p class="field-hint">
                  {{ lang.translate('admin.pages.products.categoryHint') }}
                </p>
              </div>
              <div class="form-group">
                <label>{{ lang.translate('admin.pages.products.fields.status') }} *</label>
                <select formControlName="status">
                  <option value="Live">{{ lang.translate('admin.pages.products.status.live') }}</option>
                  <option value="Draft">{{ lang.translate('admin.pages.products.status.draft') }}</option>
                  <option value="Review">{{ lang.translate('admin.pages.products.status.review') }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>{{ lang.translate('admin.pages.products.fields.origins') }} *</label>
              <input
                formControlName="origin"
                [placeholder]="lang.translate('admin.pages.products.placeholders.origins')"
              />
            </div>

            <div class="form-group">
              <label>{{ lang.translate('admin.pages.products.fields.descriptionEn') }} *</label>
              <textarea
                formControlName="description"
                rows="3"
                [placeholder]="lang.translate('admin.pages.products.placeholders.descriptionEn')"
              ></textarea>
            </div>

            <div class="form-group">
              <label>{{ lang.translate('admin.pages.products.fields.descriptionAr') }}</label>
              <textarea
                formControlName="description_ar"
                rows="3"
                [placeholder]="lang.translate('admin.pages.products.placeholders.descriptionAr')"
                dir="rtl"
              ></textarea>
            </div>

            <div class="form-group">
              <label>{{ lang.translate('admin.pages.products.fields.note') }}</label>
              <input
                formControlName="note"
                [placeholder]="lang.translate('admin.pages.products.placeholders.note')"
              />
            </div>

            <div class="panel-actions">
              <button
                type="button"
                class="cancel-btn"
                (click)="closeEditor()"
                [disabled]="isSaving()"
              >
                {{ lang.translate('admin.common.cancel') }}
              </button>
              <button type="submit" class="save-btn" [disabled]="isSubmitDisabled()">
                {{
                  isSaving()
                    ? lang.translate('admin.pages.products.savingChanges')
                    : editingProduct()
                      ? lang.translate('admin.pages.products.updateProduct')
                      : lang.translate('admin.pages.products.createProduct')
                }}
              </button>
            </div>
          </form>
        </div>
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
      .origin,
      small,
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

      .page-head button,
      .actions button,
      .panel-actions button {
        border: none;
        border-radius: 16px;
        padding: 12px 16px;
        cursor: pointer;
        font-weight: 700;
        font: inherit;
        transition: all 0.25s ease;
      }

      .page-head button,
      .save-btn {
        color: #fff;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      }

      .page-head button:hover,
      .save-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(245, 124, 0, 0.35);
      }

      .summary-strip {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .summary-item,
      .product-card {
        border-radius: 24px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition:
          background 0.4s ease,
          border-color 0.4s ease;
      }

      .summary-item {
        padding: 18px 20px;
      }

      .summary-item strong {
        display: block;
        margin-bottom: 8px;
        font-size: 2rem;
        color: var(--text-primary);
      }

      .summary-item span {
        color: var(--text-secondary);
      }

      .card-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .product-card {
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      img {
        width: 100%;
        height: 200px;
        object-fit: contain;
        background:
          radial-gradient(circle at top, rgba(245, 124, 0, 0.08), transparent 54%),
          var(--bg-surface);
        padding: 20px;
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 18px 20px 20px;
        flex-grow: 1;
      }

      .meta,
      .footer,
      .actions {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
      }

      .pill,
      .category {
        border-radius: 999px;
        padding: 5px 11px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      .pill {
        background: rgba(76, 175, 80, 0.12);
        color: #4caf50;
      }
      .pill.draft {
        background: rgba(245, 124, 0, 0.12);
        color: var(--color-primary);
      }

      .category {
        background: var(--border-color);
        color: var(--text-secondary);
      }

      .origin {
        font-weight: 700;
        color: var(--text-primary);
        font-size: 0.9rem;
      }

      .multilingual-previews {
        display: grid;
        gap: 6px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        font-size: 0.8rem;
      }
      .preview {
        display: flex;
        gap: 8px;
      }
      .preview .label {
        color: var(--text-secondary);
        white-space: nowrap;
      }
      .preview .val {
        color: var(--text-primary);
      }

      .footer {
        margin-top: auto;
        padding-top: 10px;
        align-items: flex-end;
      }

      .actions {
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .actions .secondary {
        color: var(--text-secondary);
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        font-size: 0.85rem;
        padding: 8px 12px;
      }

      .actions .delete-btn:hover {
        background: rgba(211, 47, 47, 0.1);
        color: #d32f2f;
        border-color: rgba(211, 47, 47, 0.3);
      }

      /* Editor Overlay Styles */
      .editor-overlay {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        justify-content: flex-end;
        visibility: hidden;
        pointer-events: none;
        transition: visibility 0.4s;
      }
      .editor-overlay.active {
        visibility: visible;
        pointer-events: auto;
      }

      .editor-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      .active .editor-backdrop {
        opacity: 1;
      }

      .editor-panel {
        position: relative;
        width: min(600px, 100vw);
        height: 100%;
        background: var(--bg-primary);
        border-left: 1px solid var(--border-color);
        box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      }
      .active .editor-panel {
        transform: translateX(0);
      }

      .panel-head {
        padding: 24px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .close-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-size: 2rem;
        cursor: pointer;
        line-height: 1;
      }

      .panel-body {
        flex-grow: 1;
        overflow-y: auto;
        padding: 24px;
        display: grid;
        gap: 20px;
      }

      .form-group {
        display: grid;
        gap: 8px;
      }

      .field-hint {
        font-size: 0.78rem;
        color: var(--text-secondary);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      label {
        font-weight: 700;
        font-size: 0.85rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      input,
      select,
      textarea {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 12px;
        color: var(--text-primary);
        font: inherit;
        transition: border-color 0.2s;
      }
      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: var(--color-primary);
      }

      .image-upload-group {
        margin-bottom: 10px;
      }
      .image-preview-box {
        width: 100%;
        height: 180px;
        border-radius: 16px;
        background: var(--bg-surface);
        border: 2px dashed var(--border-color);
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
        overflow: hidden;
      }
      .upload-vibe {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      .upload-vibe:hover {
        opacity: 1;
      }
      .upload-vibe .icon {
        font-size: 2rem;
        margin-bottom: 10px;
      }

      .change-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        cursor: pointer;
      }
      .image-preview-box:hover .change-overlay {
        opacity: 1;
      }
      .upload-hint {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-style: italic;
      }

      .panel-actions {
        padding: 24px;
        border-top: 1px solid var(--border-color);
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 12px;
        position: sticky;
        bottom: 0;
        background: var(--bg-primary);
      }
      .cancel-btn {
        background: var(--bg-surface);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }
      .save-btn:disabled {
        opacity: 0.5;
        filter: grayscale(1);
      }

      @media (max-width: 1180px) {
        .card-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 900px) {
        .summary-strip {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .page-head,
        .footer {
          display: grid;
          gap: 14px;
        }
        .actions {
          justify-content: flex-start;
        }

        .page-head button {
          width: 100%;
        }

        .form-row {
          grid-template-columns: 1fr;
        }

        .panel-head,
        .panel-body,
        .panel-actions {
          padding-inline: 18px;
        }

        .panel-actions {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .card-grid {
          grid-template-columns: 1fr;
        }

        .editor-panel {
          width: 100vw;
        }

        .summary-item,
        .product-card {
          border-radius: 20px;
        }
      }
    `,
  ],
})
export class AdminProductsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(PortfolioProductsApiService);
  private readonly uploadsApi = inject(UploadsApiService);
  readonly lang = inject(LanguageService);

  readonly products = signal<PortfolioProductApi[]>([]);
  readonly loading = signal(true);
  readonly isEditorOpen = signal(false);
  readonly isSaving = signal(false);
  readonly editingProduct = signal<PortfolioProductApi | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly showcaseCategories: ShowcaseCategoryOption[] = [
    { value: 'tropical', label: 'Tropical' },
    { value: 'stone', label: 'Stone' },
    { value: 'citrus', label: 'Citrus' },
    { value: 'exotic', label: 'Exotic' },
  ];

  productForm = this.fb.group({
    name: ['', [Validators.required]],
    name_ar: [''],
    category: ['tropical', [Validators.required]],
    origin: ['', [Validators.required]], // Will be comma-separated string in form, array in API
    imageUrl: [''],
    status: ['Live', [Validators.required]],
    description: ['', [Validators.required]],
    description_ar: [''],
    note: [''],
    varieties: [''],
  });

  private selectedFile: File | null = null;

  readonly liveCount = computed(() => this.products().filter((p) => p.status === 'Live').length);
  readonly draftCount = computed(() => this.products().filter((p) => p.status !== 'Live').length);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsApi
      .getProducts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.products.set(data),
        error: (error) => console.error('Failed to load products', error),
      });
  }

  openEditor(product?: PortfolioProductApi): void {
    this.selectedFile = null;
    this.previewUrl.set(null);
    this.editingProduct.set(product || null);

    if (product) {
      this.productForm.patchValue({
        name: product.name,
        name_ar: product.name_ar,
        category: product.category,
        origin: product.origin.join(', '),
        imageUrl: product.imageUrl,
        status: product.status,
        description: product.description,
        description_ar: product.description_ar,
        note: product.note,
        varieties: product.varieties?.join(', ') || '',
      });
    } else {
      this.productForm.reset({
        status: 'Live',
        category: 'tropical',
      });
    }

    this.isEditorOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
    document.body.style.overflow = '';
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onSave(): void {
    if (this.isSubmitDisabled()) return;

    this.isSaving.set(true);

    if (this.selectedFile) {
      // Step 1: Upload image if selected
      this.uploadsApi.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          this.productForm.patchValue({ imageUrl: response.url });
          this.submitForm();
        },
        error: (error) => {
          console.error('Image upload failed', error);
          this.isSaving.set(false);
        },
      });
    } else {
      this.submitForm();
    }
  }

  private submitForm(): void {
    const formValue = this.productForm.getRawValue();
    const payload: PortfolioProductPayload = {
      name: formValue.name!,
      name_ar: formValue.name_ar!,
      category: formValue.category!,
      origin: formValue
        .origin!.split(',')
        .map((s) => s.trim())
        .filter((s) => !!s),
      varieties:
        formValue.varieties
          ?.split(',')
          .map((s) => s.trim())
          .filter((s) => !!s) || [],
      imageUrl: toStoredAssetUrl(formValue.imageUrl!),
      status: formValue.status!,
      description: formValue.description!,
      description_ar: formValue.description_ar!,
      note: formValue.note!,
    };

    const request = this.editingProduct()
      ? this.productsApi.updateProduct(this.editingProduct()!.id, payload)
      : this.productsApi.createProduct(payload);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.closeEditor();
        this.loadProducts();
      },
      error: (error) => console.error('Save operation failed', error),
    });
  }

  deleteProduct(id: string): void {
    if (
      !confirm(this.lang.translate('admin.pages.products.deleteConfirm'))
    )
      return;

    this.productsApi.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: (error) => console.error('Delete operation failed', error),
    });
  }

  displayCategory(value: string): string {
    return this.lang.translate(`admin.pages.products.categories.${value}`) || value;
  }

  statusLabel(status: string): string {
    return this.lang.translate(`admin.pages.products.status.${status.toLowerCase()}`) || status;
  }

  isSubmitDisabled(): boolean {
    return this.isSaving() || !this.isFormReadyToSubmit();
  }

  private isFormReadyToSubmit(): boolean {
    const requiredControls = ['name', 'category', 'origin', 'status', 'description'];
    const requiredFieldsValid = requiredControls.every((controlName) =>
      Boolean(this.productForm.get(controlName)?.valid),
    );

    return requiredFieldsValid && this.hasImageValue();
  }

  private hasImageValue(): boolean {
    return Boolean(this.selectedFile || this.productForm.value.imageUrl?.trim());
  }
}
