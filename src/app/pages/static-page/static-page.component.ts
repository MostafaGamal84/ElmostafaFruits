import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaticPage } from '../../core/models/static-page.model';
import { StaticPagesApiService } from '../../core/services/static-pages-api.service';
import { LanguageService } from '../../core/services/language.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-static-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page" *ngIf="page() as item">
      <h1>{{ item.title }}</h1>
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
      }

      h1 {
        color: var(--text-primary);
        font-size: clamp(2rem, 5vw, 4rem);
      }

      article {
        color: var(--text-secondary);
        line-height: 1.8;
      }
    `,
  ],
})
export class StaticPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly pagesApi = inject(StaticPagesApiService);
  private readonly lang = inject(LanguageService);

  readonly page = signal<StaticPage | null>(null);

  constructor() {
    effect(() => {
      this.lang.currentLang();
      untracked(() => this.loadPage());
    });
  }

  private loadPage(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      return;
    }

    this.pagesApi.getPublicPageBySlug(slug).subscribe({
      next: (page) => this.page.set(page),
      error: (error) => console.error('Failed to load static page', error),
    });
  }
}
