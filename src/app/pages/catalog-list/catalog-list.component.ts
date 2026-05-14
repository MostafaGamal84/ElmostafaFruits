import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogProductListItem } from '../../core/models/catalog-product.model';
import { Category } from '../../core/models/category.model';
import { CatalogProductsApiService } from '../../core/services/catalog-products-api.service';
import { CategoriesApiService } from '../../core/services/categories-api.service';
import { LanguageService } from '../../core/services/language.service';
import { resolveAssetUrl } from '../../core/utils/asset-url.util';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

interface CatalogCard {
  id: string | number;
  name: string;
  shortDescription?: string;
  categorySlug?: string;
  categoryName?: string;
  coverImageUrl?: string;
  detailLink?: unknown[];
}

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page">
      <section class="head">
        <span>{{ lang.translate('pages.catalog.eyebrow') }}</span>
        <h1>{{ lang.translate('pages.catalog.title') }}</h1>
      </section>

      <div class="filters">
        <button type="button" [class.active]="!category()" (click)="loadProducts()">
          {{ lang.translate('pages.catalog.all') }}
        </button>
        <button
          type="button"
          *ngFor="let item of categories()"
          [class.active]="category() === item.slug"
          (click)="loadProducts(item.slug)"
        >
          {{ item.name }}
        </button>
      </div>

      <section class="grid">
        <article class="card" *ngFor="let product of products()">
          <img *ngIf="product.coverImageUrl" [src]="product.coverImageUrl" [alt]="product.name" />
          <div>
            <small>{{ product.categoryName }}</small>
            <h2>{{ product.name }}</h2>
            <p>{{ product.shortDescription }}</p>
            <a *ngIf="product.detailLink" [routerLink]="product.detailLink">
              {{ lang.translate('pages.catalog.viewProduct') }}
            </a>
          </div>
        </article>
      </section>

      <section class="empty" *ngIf="!loading() && products().length === 0">
        <p>No catalog products found.</p>
      </section>
    </main>
    <app-footer></app-footer>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        padding: 120px 20px 70px;
      }

      .head,
      .filters,
      .grid {
        width: min(1120px, 100%);
        margin-inline: auto;
      }

      .head span,
      small,
      a,
      .filters button.active {
        color: var(--color-primary);
        font-weight: 800;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        margin-top: 8px;
        color: var(--text-primary);
        font-size: clamp(2rem, 5vw, 4rem);
      }

      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 26px;
      }

      .filters button {
        border: 1px solid var(--border-color);
        border-radius: 999px;
        background: var(--card-bg);
        color: var(--text-primary);
        padding: 10px 14px;
        cursor: pointer;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
        margin-top: 24px;
      }

      .empty {
        width: min(1120px, 100%);
        margin: 28px auto 0;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--card-bg);
        padding: 18px;
      }

      .empty p {
        color: var(--text-secondary);
      }

      .card {
        overflow: hidden;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
      }

      .card img {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
      }

      .card div {
        display: grid;
        gap: 10px;
        padding: 16px;
      }

      .card h2 {
        color: var(--text-primary);
      }

      .card p {
        color: var(--text-secondary);
      }

      @media (max-width: 900px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CatalogListComponent {
  private readonly productsApi = inject(CatalogProductsApiService);
  private readonly categoriesApi = inject(CategoriesApiService);
  readonly lang = inject(LanguageService);

  readonly products = signal<CatalogCard[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly category = signal<string | null>(null);
  readonly loading = signal(false);

  constructor() {
    effect(() => {
      this.lang.currentLang();
      untracked(() => this.reloadForCurrentLanguage());
    });
  }

  private reloadForCurrentLanguage(): void {
    this.categoriesApi.getPublicCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => console.error('Failed to load categories', error),
    });
    this.fetchProducts(this.category());
  }

  loadProducts(category?: string): void {
    this.category.set(category ?? null);
    this.fetchProducts(category ?? null);
  }

  private fetchProducts(category: string | null): void {
    this.loading.set(true);
    this.productsApi
      .getPublicProducts({ category: category ?? undefined, page: 1, pageSize: 24 })
      .subscribe({
        next: (response) => {
          this.products.set((response.items ?? []).map((product) => this.toCatalogCard(product)));
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load catalog products', error);
          this.products.set([]);
          this.loading.set(false);
        },
      });
  }

  private toCatalogCard(product: CatalogProductListItem): CatalogCard {
    return {
      ...product,
      coverImageUrl: resolveAssetUrl(product.coverImageUrl),
      detailLink: ['/catalog', product.slug],
    };
  }
}
