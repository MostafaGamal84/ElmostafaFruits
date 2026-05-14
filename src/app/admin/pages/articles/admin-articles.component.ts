import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminArticle } from '../../../core/models/article.model';
import { AdminArticleCategory } from '../../../core/models/article-category.model';
import { ArticleCategoriesApiService } from '../../../core/services/article-categories-api.service';
import { ArticlesApiService } from '../../../core/services/articles-api.service';
import { UploadsApiService } from '../../../core/services/uploads-api.service';
import { toStoredAssetUrl } from '../../../core/utils/asset-url.util';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-admin-articles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow">{{ lang.translate('admin.pages.articles.eyebrow') }}</span>
          <h2>{{ lang.translate('admin.pages.articles.title') }}</h2>
        </div>
      </div>

      <div class="layout">
        <div class="panel">
          <h3>
            {{
              editingArticle()
                ? lang.translate('admin.pages.articles.editArticle')
                : lang.translate('admin.pages.articles.createArticle')
            }}
          </h3>
          <form [formGroup]="articleForm" (ngSubmit)="saveArticle()">
            <div class="grid">
              <input formControlName="slug" [placeholder]="lang.translate('admin.pages.articles.fields.slug')" />
              <input formControlName="titleEn" [placeholder]="lang.translate('admin.pages.articles.fields.titleEn')" />
              <input formControlName="titleAr" [placeholder]="lang.translate('admin.pages.articles.fields.titleAr')" />
              <select formControlName="categoryId">
                <option [ngValue]="null">{{ lang.translate('admin.pages.articles.fields.category') }}</option>
                <option *ngFor="let category of categories()" [ngValue]="category.id">
                  {{ category.name['en'] || category.slug }}
                </option>
              </select>
              <input formControlName="publishedAt" type="datetime-local" />
            </div>
            <div class="upload-field">
              <span>{{ lang.translate('admin.pages.articles.coverImage') }}</span>
              <div class="upload-row">
                <input
                  type="file"
                  accept="image/*"
                  (change)="onArticleImageSelected($event)"
                  #articleImageInput
                  hidden
                />
                <button
                  type="button"
                  class="ghost"
                  (click)="articleImageInput.value = ''; articleImageInput.click()"
                  [disabled]="isUploadingArticleImage()"
                >
                  {{
                    isUploadingArticleImage()
                      ? lang.translate('admin.pages.resources.uploadingImage')
                      : articleImageName() ||
                        (articleForm.value.coverImageUrl
                          ? lang.translate('admin.pages.resources.changeImage')
                          : lang.translate('admin.pages.resources.uploadImage'))
                  }}
                </button>
                <small>
                  {{
                    articleImageName()
                      ? lang.translate('admin.pages.articles.selectedCoverHelp')
                      : lang.translate('admin.pages.articles.uploadCoverHelp')
                  }}
                </small>
              </div>
              <img
                *ngIf="articlePreviewUrl() || articleForm.value.coverImageUrl"
                class="upload-preview"
                [src]="articlePreviewUrl() || articleForm.value.coverImageUrl || ''"
                [alt]="lang.translate('admin.pages.articles.coverPreviewAlt')"
              />
            </div>
            <textarea
              formControlName="excerptEn"
              rows="2"
              [placeholder]="lang.translate('admin.pages.articles.fields.excerptEn')"
            ></textarea>
            <textarea
              formControlName="excerptAr"
              rows="2"
              [placeholder]="lang.translate('admin.pages.articles.fields.excerptAr')"
            ></textarea>
            <textarea
              formControlName="bodyEn"
              rows="5"
              [placeholder]="lang.translate('admin.pages.articles.fields.bodyEn')"
            ></textarea>
            <textarea
              formControlName="bodyAr"
              rows="5"
              [placeholder]="lang.translate('admin.pages.articles.fields.bodyAr')"
            ></textarea>
            <label class="check">
              <input type="checkbox" formControlName="isPublished" />
              {{ lang.translate('admin.pages.articles.published') }}
            </label>
            <div class="actions">
              <button
                type="submit"
                [disabled]="articleForm.invalid || isUploadingArticleImage()"
              >
                {{ lang.translate('admin.pages.articles.saveArticle') }}
              </button>
              <button type="button" class="ghost" (click)="resetArticle()">
                {{ lang.translate('admin.common.clear') }}
              </button>
            </div>
          </form>
        </div>

        <div class="panel">
          <h3>{{ lang.translate('admin.pages.articles.categories') }}</h3>
          <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" class="category-form">
            <input formControlName="slug" [placeholder]="lang.translate('admin.pages.articles.fields.slug')" />
            <input formControlName="nameEn" [placeholder]="lang.translate('admin.pages.articles.fields.nameEn')" />
            <input formControlName="nameAr" [placeholder]="lang.translate('admin.pages.articles.fields.nameAr')" />
            <button type="submit" [disabled]="categoryForm.invalid">
              {{
                editingCategory()
                  ? lang.translate('admin.pages.articles.updateCategory')
                  : lang.translate('admin.pages.articles.addCategory')
              }}
            </button>
          </form>
          <div class="mini-list">
            <article *ngFor="let category of categories()">
              <span>{{ category.name['en'] || category.slug }}</span>
              <div>
                <button type="button" (click)="editCategory(category)">
                  {{ lang.translate('admin.common.edit') }}
                </button>
                <button type="button" class="danger" (click)="deleteCategory(category.id)">
                  {{ lang.translate('admin.common.delete') }}
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div class="table panel">
        <article class="row" *ngFor="let article of articles()">
          <div>
            <strong>{{ article.title['en'] || article.slug }}</strong>
            <small>
              {{ article.slug }} · {{ article.categorySlug }} ·
              {{
                article.isPublished
                  ? lang.translate('admin.pages.articles.published')
                  : lang.translate('admin.pages.products.status.draft')
              }}
            </small>
          </div>
          <div class="row-actions">
            <button type="button" (click)="editArticle(article)">{{ lang.translate('admin.common.edit') }}</button>
            <button type="button" class="danger" (click)="deleteArticle(article.id)">
              {{ lang.translate('admin.common.delete') }}
            </button>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page,
      form,
      .panel,
      .mini-list {
        display: grid;
        gap: 14px;
      }

      .page-head,
      .row,
      .mini-list article {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        align-items: center;
        flex-wrap: wrap;
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
        display: block;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.8fr);
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

      input,
      select,
      textarea {
        width: 100%;
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
        max-width: 240px;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid var(--border-color);
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

      .actions,
      .row-actions,
      .mini-list article div {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .check {
        color: var(--text-primary);
      }

      .row {
        border-top: 1px solid var(--border-color);
        padding: 12px 0;
      }

      .row strong,
      .mini-list span {
        word-break: break-word;
      }

      @media (max-width: 1050px) {
        .layout,
        .grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .panel {
          padding: 16px;
        }

        .page-head,
        .row,
        .mini-list article {
          display: grid;
          grid-template-columns: 1fr;
          align-items: flex-start;
        }

        .row-actions,
        .mini-list article div {
          justify-content: flex-start;
        }

        small {
          line-height: 1.6;
          word-break: break-word;
        }
      }
    `,
  ],
})
export class AdminArticlesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly articlesApi = inject(ArticlesApiService);
  private readonly categoriesApi = inject(ArticleCategoriesApiService);
  private readonly uploadsApi = inject(UploadsApiService);
  readonly lang = inject(LanguageService);

  readonly articles = signal<AdminArticle[]>([]);
  readonly categories = signal<AdminArticleCategory[]>([]);
  readonly editingArticle = signal<AdminArticle | null>(null);
  readonly editingCategory = signal<AdminArticleCategory | null>(null);
  readonly articlePreviewUrl = signal<string | null>(null);
  readonly articleImageName = signal('');
  readonly isUploadingArticleImage = signal(false);

  readonly articleForm = this.fb.group({
    slug: [''],
    titleEn: ['', Validators.required],
    titleAr: [''],
    excerptEn: [''],
    excerptAr: [''],
    bodyEn: ['', Validators.required],
    bodyAr: [''],
    coverImageUrl: [''],
    categoryId: [null as number | null],
    publishedAt: [''],
    isPublished: [true],
  });

  readonly categoryForm = this.fb.group({
    slug: [''],
    nameEn: ['', Validators.required],
    nameAr: [''],
  });

  private selectedArticleImage: File | null = null;

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.articlesApi.getAdminArticles({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => this.articles.set(response.items ?? []),
      error: (error) => console.error('Failed to load admin articles', error),
    });
    this.categoriesApi.getAdminCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => console.error('Failed to load article categories', error),
    });
  }

  saveArticle(): void {
    if (this.articleForm.invalid || this.isUploadingArticleImage()) {
      return;
    }

    if (this.selectedArticleImage) {
      this.isUploadingArticleImage.set(true);
      this.uploadsApi.uploadImage(this.selectedArticleImage, 'articles').subscribe({
        next: (response) => {
          this.articleForm.patchValue({ coverImageUrl: response.url });
          this.commitArticleSave(() => this.isUploadingArticleImage.set(false));
        },
        error: (error) => {
          this.isUploadingArticleImage.set(false);
          console.error('Failed to upload article cover', error);
        },
      });
      return;
    }

    this.commitArticleSave();
  }

  editArticle(article: AdminArticle): void {
    this.editingArticle.set(article);
    this.clearArticleImageSelection();
    this.articleForm.patchValue({
      slug: article.slug,
      titleEn: article.title?.['en'] ?? '',
      titleAr: article.title?.['ar'] ?? '',
      excerptEn: article.excerpt?.['en'] ?? '',
      excerptAr: article.excerpt?.['ar'] ?? '',
      bodyEn: article.body?.['en'] ?? '',
      bodyAr: article.body?.['ar'] ?? '',
      coverImageUrl: article.coverImageUrl,
      categoryId: article.categoryId,
      publishedAt: article.publishedAt ? article.publishedAt.slice(0, 16) : '',
      isPublished: article.isPublished,
    });
  }

  resetArticle(): void {
    this.editingArticle.set(null);
    this.clearArticleImageSelection();
    this.articleForm.reset({ isPublished: true });
  }

  onArticleImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    this.selectedArticleImage = file;
    this.articleImageName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => this.articlePreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  private commitArticleSave(onComplete?: () => void): void {
    const value = this.articleForm.getRawValue();
    const payload = {
      slug: value.slug ?? '',
      title: { en: value.titleEn ?? '', ar: value.titleAr ?? '' },
      excerpt: { en: value.excerptEn ?? '', ar: value.excerptAr ?? '' },
      body: { en: value.bodyEn ?? '', ar: value.bodyAr ?? '' },
      coverImageUrl: toStoredAssetUrl(value.coverImageUrl ?? ''),
      categoryId: value.categoryId ?? 0,
      publishedAt: value.publishedAt
        ? new Date(value.publishedAt).toISOString()
        : new Date().toISOString(),
      isPublished: Boolean(value.isPublished),
    };

    const request = this.editingArticle()
      ? this.articlesApi.updateArticle(this.editingArticle()!.id, payload)
      : this.articlesApi.createArticle(payload);

    request
      .pipe(finalize(() => onComplete?.()))
      .subscribe({
        next: () => {
          this.resetArticle();
          this.loadAll();
        },
        error: (error) => console.error('Failed to save article', error),
      });
  }

  deleteArticle(id: number): void {
    if (!confirm(this.lang.translate('admin.pages.articles.deleteArticleConfirm'))) {
      return;
    }
    this.articlesApi.deleteArticle(id).subscribe({
      next: () => this.loadAll(),
      error: (error) => console.error('Failed to delete article', error),
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
    };
    const request = this.editingCategory()
      ? this.categoriesApi.updateCategory(this.editingCategory()!.id, payload)
      : this.categoriesApi.createCategory(payload);

    request.subscribe({
      next: () => {
        this.editingCategory.set(null);
        this.categoryForm.reset();
        this.loadAll();
      },
      error: (error) => console.error('Failed to save article category', error),
    });
  }

  private clearArticleImageSelection(): void {
    this.selectedArticleImage = null;
    this.articleImageName.set('');
    this.articlePreviewUrl.set(null);
  }

  editCategory(category: AdminArticleCategory): void {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      slug: category.slug,
      nameEn: category.name?.['en'] ?? '',
      nameAr: category.name?.['ar'] ?? '',
    });
  }

  deleteCategory(id: number): void {
    if (!confirm(this.lang.translate('admin.pages.articles.deleteCategoryConfirm'))) {
      return;
    }
    this.categoriesApi.deleteCategory(id).subscribe({
      next: () => this.loadAll(),
      error: (error) => console.error('Failed to delete article category', error),
    });
  }
}
