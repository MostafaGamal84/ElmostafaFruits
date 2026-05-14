import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ArticleCategory } from '../../core/models/article-category.model';
import { ArticleSummary } from '../../core/models/article.model';
import { ArticleCategoriesApiService } from '../../core/services/article-categories-api.service';
import { ArticlesApiService } from '../../core/services/articles-api.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page">
      <section class="head">
        <span>{{ lang.translate('pages.blog.eyebrow') }}</span>
        <h1>{{ lang.translate('pages.blog.title') }}</h1>
      </section>

      <div class="filters">
        <button type="button" [class.active]="!selectedCategory()" (click)="loadArticles()">
          {{ lang.translate('pages.blog.all') }}
        </button>
        <button
          type="button"
          *ngFor="let category of categories()"
          [class.active]="selectedCategory() === category.slug"
          (click)="loadArticles(category.slug)"
        >
          {{ category.name }}
        </button>
      </div>

      <section class="grid">
        <article class="card" *ngFor="let article of articles()">
          <img *ngIf="article.coverImageUrl" [src]="article.coverImageUrl" [alt]="article.title" />
          <div>
            <small>{{ article.categoryName }} · {{ article.publishedAt | date }}</small>
            <h2>{{ article.title }}</h2>
            <p>{{ article.excerpt }}</p>
            <a [routerLink]="['/blog', article.slug]">{{
              lang.translate('pages.blog.readArticle')
            }}</a>
          </div>
        </article>
      </section>
    </main>
    <app-footer></app-footer>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        padding: 120px 20px 70px;
        background: var(--bg-primary);
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

      .card {
        overflow: hidden;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
      }

      .card img {
        width: 100%;
        aspect-ratio: 16 / 10;
        object-fit: cover;
      }

      .card div {
        display: grid;
        gap: 10px;
        padding: 16px;
      }

      .card h2 {
        color: var(--text-primary);
        font-size: 1.2rem;
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
export class BlogListComponent {
  private readonly articlesApi = inject(ArticlesApiService);
  private readonly categoriesApi = inject(ArticleCategoriesApiService);
  readonly lang = inject(LanguageService);

  readonly articles = signal<ArticleSummary[]>([]);
  readonly categories = signal<ArticleCategory[]>([]);
  readonly selectedCategory = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.lang.currentLang();
      untracked(() => this.reloadForCurrentLanguage());
    });
  }

  private reloadForCurrentLanguage(): void {
    this.categoriesApi.getPublicCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => console.error('Failed to load article categories', error),
    });
    this.fetchArticles(this.selectedCategory());
  }

  loadArticles(category?: string): void {
    this.selectedCategory.set(category ?? null);
    this.fetchArticles(category ?? null);
  }

  private fetchArticles(category: string | null): void {
    this.articlesApi.getPublicArticles({ category: category ?? undefined, page: 1, pageSize: 24 }).subscribe({
      next: (response) => this.articles.set(response.items ?? []),
      error: (error) => console.error('Failed to load articles', error),
    });
  }
}
