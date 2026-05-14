import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminCatalogProduct } from '../../../core/models/catalog-product.model';
import { AdminCategory } from '../../../core/models/category.model';
import { CatalogProductsApiService } from '../../../core/services/catalog-products-api.service';
import { CategoriesApiService } from '../../../core/services/categories-api.service';
import { UploadsApiService } from '../../../core/services/uploads-api.service';
import { toStoredAssetUrl } from '../../../core/utils/asset-url.util';
import { LanguageService } from '../../../core/services/language.service';

type CatalogAdminTab = 'products' | 'categories';

@Component({
  selector: 'app-admin-catalog-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow">{{ lang.translate('admin.pages.catalogProducts.eyebrow') }}</span>
          <h2>{{ lang.translate('admin.pages.catalogProducts.title') }}</h2>
          <p class="page-copy">
            Products are the visible catalog cards. Categories are filters; they only show products
            after a product is assigned to them.
          </p>
        </div>
      </div>

      <div class="tabs">
        <button
          type="button"
          [class.active]="activeTab() === 'products'"
          (click)="setActiveTab('products')"
        >
          Products
        </button>
        <button
          type="button"
          [class.active]="activeTab() === 'categories'"
          (click)="setActiveTab('categories')"
        >
          Categories
          <span class="count-pill">{{ categories().length }}</span>
        </button>
      </div>

      <section class="tab-note" *ngIf="activeTab() === 'products'">
        Add products here. Choose a category so the product appears under that public catalog
        filter.
      </section>

      <section class="tab-note" *ngIf="activeTab() === 'categories'">
        Add filters here. A category by itself creates a filter button, but it will look empty until
        products are assigned to it.
      </section>

      <div class="layout" *ngIf="activeTab() === 'products'">
        <form class="panel" [formGroup]="form" (ngSubmit)="save()">
          <h3>
            {{
              editing()
                ? lang.translate('admin.pages.catalogProducts.editProduct')
                : lang.translate('admin.pages.catalogProducts.createProduct')
            }}
          </h3>
          <div class="grid">
            <input formControlName="slug" [placeholder]="lang.translate('admin.pages.articles.fields.slug')" />
            <select formControlName="categoryId">
              <option [ngValue]="null">{{ lang.translate('admin.pages.articles.fields.category') }}</option>
              <option *ngFor="let category of categories()" [ngValue]="category.id">
                {{ category.name['en'] || category.slug }}
              </option>
            </select>
            <input formControlName="nameEn" [placeholder]="lang.translate('admin.pages.articles.fields.nameEn')" />
            <input formControlName="nameAr" [placeholder]="lang.translate('admin.pages.articles.fields.nameAr')" />
            <input formControlName="originEn" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.originEn')" />
            <input formControlName="originAr" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.originAr')" />
            <input formControlName="seasonEn" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.seasonEn')" />
            <input formControlName="seasonAr" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.seasonAr')" />
            <input formControlName="calibersEn" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.calibersEn')" />
            <input formControlName="calibersAr" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.calibersAr')" />
            <input formControlName="packagingEn" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.packagingEn')" />
            <input formControlName="packagingAr" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.packagingAr')" />
            <input
              formControlName="sortOrder"
              type="number"
              [placeholder]="lang.translate('admin.pages.resources.fields.sortOrder')"
            />
          </div>
          <textarea
            formControlName="shortEn"
            rows="2"
            [placeholder]="lang.translate('admin.pages.catalogProducts.fields.shortEn')"
          ></textarea>
          <textarea
            formControlName="shortAr"
            rows="2"
            [placeholder]="lang.translate('admin.pages.catalogProducts.fields.shortAr')"
          ></textarea>
          <textarea
            formControlName="longEn"
            rows="4"
            [placeholder]="lang.translate('admin.pages.catalogProducts.fields.longEn')"
          ></textarea>
          <textarea
            formControlName="longAr"
            rows="4"
            [placeholder]="lang.translate('admin.pages.catalogProducts.fields.longAr')"
          ></textarea>
          <div class="checks">
            <label>
              <input type="checkbox" formControlName="isFeatured" />
              {{ lang.translate('admin.pages.catalogProducts.featured') }}
            </label>
            <label>
              <input type="checkbox" formControlName="isActive" />
              {{ lang.translate('admin.common.active') }}
            </label>
          </div>
          <div class="actions">
            <button type="submit" [disabled]="form.invalid">
              {{ lang.translate('admin.pages.catalogProducts.saveProduct') }}
            </button>
            <button type="button" class="ghost" (click)="reset()">
              {{ lang.translate('admin.common.clear') }}
            </button>
          </div>
        </form>

        <div class="panel image-panel" *ngIf="editing() as product">
          <h3>{{ lang.translate('admin.pages.catalogProducts.imagesFor') }} {{ product.name['en'] || product.slug }}</h3>
          <form [formGroup]="imageForm" (ngSubmit)="addImage()">
            <div class="image-upload">
              <input
                type="file"
                accept="image/*"
                (change)="onImageSelected($event)"
                #catalogImageInput
                hidden
              />
              <button
                type="button"
                class="ghost"
                (click)="catalogImageInput.value = ''; catalogImageInput.click()"
                [disabled]="isUploadingImage()"
              >
                {{
                  isUploadingImage()
                    ? lang.translate('admin.pages.resources.uploadingImage')
                    : selectedImageName() || lang.translate('admin.pages.catalogProducts.chooseImageFile')
                }}
              </button>
              <small>
                {{
                  selectedImageName()
                    ? lang.translate('admin.pages.catalogProducts.selectedImageHelp')
                    : lang.translate('admin.pages.resources.uploadImageHelp')
                }}
              </small>
              <img
                *ngIf="imagePreviewUrl()"
                class="pending-image-preview"
                [src]="imagePreviewUrl()!"
                [alt]="lang.translate('admin.pages.catalogProducts.imagePreviewAlt')"
              />
            </div>
            <input formControlName="altEn" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.altEn')" />
            <input formControlName="altAr" [placeholder]="lang.translate('admin.pages.catalogProducts.fields.altAr')" />
            <input
              formControlName="sortOrder"
              type="number"
              [placeholder]="lang.translate('admin.pages.resources.fields.sortOrder')"
            />
            <label>
              <input type="checkbox" formControlName="isCover" />
              {{ lang.translate('admin.pages.catalogProducts.cover') }}
            </label>
            <button type="submit" [disabled]="!selectedImageName() || isUploadingImage()">
              {{ lang.translate('admin.pages.catalogProducts.addImage') }}
            </button>
          </form>
          <article class="image-row" *ngFor="let image of product.images || []">
            <img [src]="image.url" [alt]="imageAlt(image.alt)" />
            <span>{{ image.url }}</span>
            <button type="button" class="danger" (click)="deleteImage(product.id, image.id)">
              {{ lang.translate('admin.common.delete') }}
            </button>
          </article>
        </div>
      </div>

      <div class="panel list" *ngIf="activeTab() === 'products'">
        <article class="list-row" *ngFor="let product of products()">
          <div class="item-copy">
            <strong>{{ productTitle(product) }}</strong>
            <div class="meta-line">
              <span class="slug-text" dir="ltr">{{ product.categorySlug || 'uncategorized' }}</span>
              <span class="status-pill" [class.inactive]="!product.isActive">
                {{
                  product.isActive
                    ? lang.translate('admin.common.active')
                    : lang.translate('admin.pages.catalogProducts.hidden')
                }}
              </span>
            </div>
          </div>
          <div class="row-actions">
            <button type="button" (click)="edit(product)">{{ lang.translate('admin.common.edit') }}</button>
            <button type="button" class="danger" (click)="remove(product.id)">
              {{ lang.translate('admin.common.delete') }}
            </button>
          </div>
        </article>
      </div>

      <div class="layout categories-layout" *ngIf="activeTab() === 'categories'">
        <form class="panel" [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
          <h3>{{ categoryEditing() ? 'Edit Category' : 'Create Category' }}</h3>
          <p class="panel-copy">
            This creates the filter button in the public catalog. Add products to this category to
            make the filter show results.
          </p>

          <div class="grid">
            <input formControlName="slug" placeholder="slug / key" />
            <input formControlName="nameEn" placeholder="name/title/label EN" />
            <input formControlName="nameAr" placeholder="name/title/label AR" />
            <input formControlName="descriptionEn" placeholder="description/body EN" />
            <input formControlName="descriptionAr" placeholder="description/body AR" />
            <input formControlName="icon" placeholder="icon" />
            <input formControlName="sortOrder" type="number" placeholder="sort order" />
          </div>

          <label class="check">
            <input type="checkbox" formControlName="isActive" />
            {{ lang.translate('admin.common.active') }}
          </label>

          <div class="actions">
            <button type="submit" [disabled]="categoryForm.invalid">
              {{ lang.translate('admin.common.save') }}
            </button>
            <button type="button" class="ghost" (click)="resetCategoryForm()">
              {{ lang.translate('admin.common.clear') }}
            </button>
          </div>
        </form>

        <div class="panel list">
          <article class="list-row category-row" *ngFor="let category of categories()">
            <div class="item-copy">
              <div class="title-line">
                <strong>{{ categoryTitle(category) }}</strong>
                <span class="product-count">{{ category.productCount || 0 }} products</span>
              </div>
              <small class="slug-text" dir="ltr">{{ category.slug }}</small>
              <p class="empty-hint" *ngIf="!category.productCount">
                Empty filter. Add a product and select this category.
              </p>
            </div>
            <div class="row-actions">
              <button type="button" (click)="editCategory(category)">
                {{ lang.translate('admin.common.edit') }}
              </button>
              <button type="button" class="danger" (click)="removeCategory(category)">
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
      .panel,
      .list,
      .image-panel {
        display: grid;
        gap: 14px;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(320px, 0.8fr);
        gap: 16px;
      }

      .page-head,
      .row,
      .actions,
      .checks,
      .image-row,
      .tabs {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .page-head,
      .row {
        justify-content: space-between;
        align-items: center;
      }

      .panel {
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        border-radius: 8px;
        padding: 18px;
      }

      .page-copy,
      .panel-copy,
      .tab-note,
      .empty-hint {
        margin: 8px 0 0;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .page-copy {
        max-width: 720px;
      }

      .tabs {
        align-items: center;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        border-radius: 8px;
        padding: 8px;
        width: fit-content;
      }

      .tabs button {
        background: transparent;
        color: var(--text-secondary);
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .tabs button.active {
        background: var(--color-primary);
        color: #fff;
      }

      .count-pill {
        min-width: 22px;
        height: 22px;
        border-radius: 999px;
        display: inline-grid;
        place-items: center;
        padding: 0 7px;
        background: rgba(255, 255, 255, 0.14);
        font-size: 0.78rem;
      }

      .tab-note {
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        border-radius: 8px;
        padding: 12px 14px;
        margin: 0;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
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
      strong,
      label {
        color: var(--text-primary);
      }

      small,
      .image-row span,
      .empty-hint {
        color: var(--text-secondary);
      }

      input,
      select,
      textarea {
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-primary);
        border-radius: 6px;
        padding: 11px 12px;
        font: inherit;
      }

      button {
        border: 0;
        border-radius: 6px;
        padding: 10px 13px;
        background: var(--color-primary);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }

      .ghost {
        background: var(--border-color);
        color: var(--text-primary);
      }

      .danger {
        background: #d32f2f;
      }

      .check {
        color: var(--text-primary);
      }

      .image-upload {
        display: grid;
        gap: 10px;
      }

      .image-upload small {
        color: var(--text-secondary);
      }

      .pending-image-preview {
        width: 100%;
        max-width: 220px;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }

      .image-row {
        align-items: center;
        border-top: 1px solid var(--border-color);
        padding-top: 12px;
      }

      .image-row img {
        width: 70px;
        height: 54px;
        object-fit: cover;
        border-radius: 6px;
      }

      .list {
        gap: 12px;
      }

      .list-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 12px;
        align-items: center;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        border-radius: 8px;
        padding: 14px;
      }

      .category-row {
        align-items: flex-start;
      }

      .item-copy {
        min-width: 0;
        display: grid;
        gap: 6px;
        text-align: start;
      }

      .item-copy strong {
        overflow-wrap: anywhere;
      }

      .title-line,
      .meta-line,
      .row-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .title-line,
      .meta-line {
        flex-wrap: wrap;
      }

      .row-actions {
        justify-content: flex-end;
        flex-wrap: nowrap;
      }

      .row-actions button {
        white-space: nowrap;
      }

      .slug-text {
        color: var(--text-secondary);
        direction: ltr;
        unicode-bidi: plaintext;
        overflow-wrap: anywhere;
      }

      .status-pill,
      .product-count {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        border-radius: 999px;
        padding: 3px 9px;
        background: rgba(245, 124, 0, 0.14);
        color: var(--color-primary);
        font-size: 0.78rem;
        font-weight: 800;
      }

      .status-pill.inactive {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-secondary);
      }

      .empty-hint {
        font-size: 0.86rem;
      }

      @media (max-width: 1050px) {
        .layout,
        .grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .page-head,
        .row,
        .list-row,
        .image-row {
          display: grid;
          grid-template-columns: 1fr;
          align-items: flex-start;
        }

        .panel {
          padding: 16px;
        }

        .actions,
        .checks,
        .row-actions {
          justify-content: flex-start;
        }

        .image-row span {
          word-break: break-word;
        }
      }
    `,
  ],
})
export class AdminCatalogProductsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(CatalogProductsApiService);
  private readonly categoriesApi = inject(CategoriesApiService);
  private readonly uploadsApi = inject(UploadsApiService);
  readonly lang = inject(LanguageService);

  readonly products = signal<AdminCatalogProduct[]>([]);
  readonly categories = signal<AdminCategory[]>([]);
  readonly activeTab = signal<CatalogAdminTab>('products');
  readonly editing = signal<AdminCatalogProduct | null>(null);
  readonly categoryEditing = signal<AdminCategory | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly selectedImageName = signal('');
  readonly isUploadingImage = signal(false);

  readonly form = this.fb.group({
    slug: [''],
    categoryId: [null as number | null, Validators.required],
    nameEn: ['', Validators.required],
    nameAr: [''],
    shortEn: [''],
    shortAr: [''],
    longEn: [''],
    longAr: [''],
    originEn: [''],
    originAr: [''],
    seasonEn: [''],
    seasonAr: [''],
    calibersEn: [''],
    calibersAr: [''],
    packagingEn: [''],
    packagingAr: [''],
    sortOrder: [0],
    isFeatured: [false],
    isActive: [true],
  });

  readonly imageForm = this.fb.group({
    url: [''],
    altEn: [''],
    altAr: [''],
    sortOrder: [0],
    isCover: [false],
  });

  readonly categoryForm = this.fb.group({
    slug: [''],
    nameEn: ['', Validators.required],
    nameAr: [''],
    descriptionEn: [''],
    descriptionAr: [''],
    icon: [''],
    sortOrder: [0],
    isActive: [true],
  });

  private selectedImageFile: File | null = null;

  ngOnInit(): void {
    this.load();
    this.loadCategories();
  }

  load(): void {
    this.productsApi.getAdminProducts({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => this.products.set(response.items ?? []),
      error: (error) => console.error('Failed to load catalog products', error),
    });
  }

  loadCategories(): void {
    this.categoriesApi.getAdminCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => console.error('Failed to load catalog categories', error),
    });
  }

  setActiveTab(tab: CatalogAdminTab): void {
    this.activeTab.set(tab);
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      categoryId: value.categoryId ?? 0,
      slug: value.slug ?? '',
      name: { en: value.nameEn ?? '', ar: value.nameAr ?? '' },
      shortDescription: { en: value.shortEn ?? '', ar: value.shortAr ?? '' },
      longDescription: { en: value.longEn ?? '', ar: value.longAr ?? '' },
      origin: { en: value.originEn ?? '', ar: value.originAr ?? '' },
      season: { en: value.seasonEn ?? '', ar: value.seasonAr ?? '' },
      calibers: { en: value.calibersEn ?? '', ar: value.calibersAr ?? '' },
      packagingDetails: { en: value.packagingEn ?? '', ar: value.packagingAr ?? '' },
      isFeatured: Boolean(value.isFeatured),
      isActive: Boolean(value.isActive),
      sortOrder: value.sortOrder ?? 0,
    };

    const request = this.editing()
      ? this.productsApi.updateProduct(this.editing()!.id, payload)
      : this.productsApi.createProduct(payload);

    request.subscribe({
      next: () => {
        this.reset();
        this.load();
        this.loadCategories();
      },
      error: (error) => console.error('Failed to save catalog product', error),
    });
  }

  edit(product: AdminCatalogProduct): void {
    this.activeTab.set('products');
    this.editing.set(product);
    this.clearPendingImage();
    this.form.patchValue({
      slug: product.slug,
      categoryId: product.categoryId,
      nameEn: product.name?.['en'] ?? '',
      nameAr: product.name?.['ar'] ?? '',
      shortEn: product.shortDescription?.['en'] ?? '',
      shortAr: product.shortDescription?.['ar'] ?? '',
      longEn: product.longDescription?.['en'] ?? '',
      longAr: product.longDescription?.['ar'] ?? '',
      originEn: product.origin?.['en'] ?? '',
      originAr: product.origin?.['ar'] ?? '',
      seasonEn: product.season?.['en'] ?? '',
      seasonAr: product.season?.['ar'] ?? '',
      calibersEn: product.calibers?.['en'] ?? '',
      calibersAr: product.calibers?.['ar'] ?? '',
      packagingEn: product.packagingDetails?.['en'] ?? '',
      packagingAr: product.packagingDetails?.['ar'] ?? '',
      sortOrder: product.sortOrder,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
  }

  reset(): void {
    this.editing.set(null);
    this.form.reset({ sortOrder: 0, isFeatured: false, isActive: true });
    this.imageForm.reset({ sortOrder: 0, isCover: false });
    this.clearPendingImage();
  }

  remove(id: number): void {
    if (!confirm(this.lang.translate('admin.pages.catalogProducts.deleteProductConfirm'))) {
      return;
    }
    this.productsApi.deleteProduct(id).subscribe({
      next: () => {
        this.load();
        this.loadCategories();
      },
      error: (error) => console.error('Failed to delete catalog product', error),
    });
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    const value = this.categoryForm.getRawValue();
    const payload = {
      slug: value.slug ?? '',
      name: { en: value.nameEn ?? '', ar: value.nameAr ?? '' },
      description: { en: value.descriptionEn ?? '', ar: value.descriptionAr ?? '' },
      icon: value.icon ?? '',
      sortOrder: value.sortOrder ?? 0,
      isActive: Boolean(value.isActive),
    };

    const request = this.categoryEditing()
      ? this.categoriesApi.updateCategory(this.categoryEditing()!.id, payload)
      : this.categoriesApi.createCategory(payload);

    request.subscribe({
      next: () => {
        this.resetCategoryForm();
        this.loadCategories();
      },
      error: (error) => console.error('Failed to save catalog category', error),
    });
  }

  editCategory(category: AdminCategory): void {
    this.activeTab.set('categories');
    this.categoryEditing.set(category);
    this.categoryForm.patchValue({
      slug: category.slug,
      nameEn: category.name?.['en'] ?? '',
      nameAr: category.name?.['ar'] ?? '',
      descriptionEn: category.description?.['en'] ?? '',
      descriptionAr: category.description?.['ar'] ?? '',
      icon: category.icon ?? '',
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive,
    });
  }

  resetCategoryForm(): void {
    this.categoryEditing.set(null);
    this.categoryForm.reset({ sortOrder: 0, isActive: true });
  }

  removeCategory(category: AdminCategory): void {
    const hasProducts = Number(category.productCount) > 0;
    const message = hasProducts
      ? 'This category has products assigned to it. Delete it anyway?'
      : 'Delete this catalog category?';

    if (!confirm(message)) {
      return;
    }

    this.categoriesApi.deleteCategory(category.id).subscribe({
      next: () => {
        if (this.categoryEditing()?.id === category.id) {
          this.resetCategoryForm();
        }
        this.loadCategories();
        this.load();
      },
      error: (error) => console.error('Failed to delete catalog category', error),
    });
  }

  addImage(): void {
    const product = this.editing();
    if (!product || !this.selectedImageFile || this.isUploadingImage()) {
      return;
    }

    this.isUploadingImage.set(true);
    const value = this.imageForm.getRawValue();
    this.uploadsApi
      .uploadImage(this.selectedImageFile, 'catalog')
      .subscribe({
        next: (response) => {
          this.productsApi
            .addImage(product.id, {
              url: toStoredAssetUrl(response.url),
              alt: { en: value.altEn ?? '', ar: value.altAr ?? '' },
              sortOrder: value.sortOrder ?? 0,
              isCover: Boolean(value.isCover),
            })
            .pipe(finalize(() => this.isUploadingImage.set(false)))
            .subscribe({
              next: () => {
                this.imageForm.reset({ sortOrder: 0, isCover: false });
                this.clearPendingImage();
                this.reloadEditing(product.id);
              },
              error: (error) => console.error('Failed to add product image', error),
            });
        },
        error: (error) => {
          this.isUploadingImage.set(false);
          console.error('Failed to upload product image', error);
        },
      });
  }

  deleteImage(productId: number, imageId: number): void {
    if (!confirm(this.lang.translate('admin.pages.catalogProducts.deleteImageConfirm'))) {
      return;
    }

    this.productsApi.deleteImage(productId, imageId).subscribe({
      next: () => this.reloadEditing(productId),
      error: (error) => console.error('Failed to delete image', error),
    });
  }

  imageAlt(alt: unknown): string {
    return typeof alt === 'string' ? alt : (alt as Record<string, string> | undefined)?.['en'] ?? '';
  }

  productTitle(product: AdminCatalogProduct): string {
    return this.localizedValue(product.name, product.slug);
  }

  categoryTitle(category: AdminCategory): string {
    return this.localizedValue(category.name, category.slug);
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    this.selectedImageFile = file;
    this.selectedImageName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => this.imagePreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  private reloadEditing(id: number): void {
    this.productsApi.getAdminProductById(id).subscribe({
      next: (product) => {
        this.editing.set(product);
        this.load();
        this.loadCategories();
      },
      error: (error) => console.error('Failed to reload catalog product', error),
    });
  }

  private clearPendingImage(): void {
    this.selectedImageFile = null;
    this.selectedImageName.set('');
    this.imagePreviewUrl.set(null);
    this.imageForm.patchValue({ url: '' });
  }

  private localizedValue(value: Record<string, string> | undefined, fallback: string): string {
    const current = this.lang.currentLang();
    return value?.[current] || value?.['en'] || value?.['ar'] || fallback;
  }
}
