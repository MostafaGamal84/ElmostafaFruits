import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleDetails } from '../../core/models/article.model';
import { ArticlesApiService } from '../../core/services/articles-api.service';
import { LanguageService } from '../../core/services/language.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page" *ngIf="article() as item">
      <a routerLink="/blog" class="back">{{ lang.translate('pages.blog.back') }}</a>
      <img *ngIf="item.coverImageUrl" [src]="item.coverImageUrl" [alt]="item.title" />
      <span>{{ item.categoryName }} · {{ item.publishedAt | date }}</span>
      <h1>{{ item.title }}</h1>
      <p class="excerpt">{{ item.excerpt }}</p>
      <article [innerHTML]="item.body"></article>
    </main>
    <app-footer></app-footer>
  `,
  styles: [
    `
      .page {
        width: min(880px, calc(100% - 40px));
        margin: 0 auto;
        padding: 120px 0 70px;
        color: var(--text-primary);
      }

      img {
        width: 100%;
        max-height: 460px;
        object-fit: cover;
        border-radius: 8px;
        margin: 20px 0;
      }

      .back,
      span {
        color: var(--color-primary);
        font-weight: 800;
      }

      h1 {
        font-size: clamp(2rem, 5vw, 4rem);
        margin: 12px 0;
      }

      .excerpt {
        color: var(--text-secondary);
        font-size: 1.15rem;
      }

      article {
        margin-top: 28px;
        line-height: 1.8;
      }
    `,
  ],
})
export class ArticleDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly articlesApi = inject(ArticlesApiService);
  readonly lang = inject(LanguageService);

  readonly article = signal<ArticleDetails | null>(null);

  constructor() {
    effect(() => {
      this.lang.currentLang();
      untracked(() => this.loadArticle());
    });
  }

  private loadArticle(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      return;
    }

    this.articlesApi.getPublicArticleBySlug(slug).subscribe({
      next: (article) => this.article.set(article),
      error: (error) => console.error('Failed to load article', error),
    });
  }
}
