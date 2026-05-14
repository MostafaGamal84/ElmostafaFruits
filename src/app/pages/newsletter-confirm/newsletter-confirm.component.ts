import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NewsletterApiService } from '../../core/services/newsletter-api.service';
import { LanguageService } from '../../core/services/language.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-newsletter-confirm',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page">
      <h1>{{ lang.translate('pages.newsletterFlow.confirmTitle') }}</h1>
      <p>{{ status() }}</p>
      <a routerLink="/">{{ lang.translate('pages.common.backToPortfolio') }}</a>
    </main>
    <app-footer></app-footer>
  `,
  styles: [
    `
      .page {
        min-height: 70vh;
        display: grid;
        place-content: center;
        gap: 12px;
        padding: 40px;
        text-align: center;
      }

      h1 {
        color: var(--text-primary);
      }

      p,
      a {
        color: var(--color-primary);
        font-weight: 800;
      }
    `,
  ],
})
export class NewsletterConfirmComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly newsletterApi = inject(NewsletterApiService);
  readonly lang = inject(LanguageService);

  readonly status = signal(this.lang.translate('pages.newsletterFlow.confirming'));

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set(this.lang.translate('pages.newsletterFlow.missingToken'));
      return;
    }

    this.newsletterApi.confirm(token).subscribe({
      next: () => this.status.set(this.lang.translate('pages.newsletterFlow.confirmed')),
      error: () => this.status.set(this.lang.translate('pages.newsletterFlow.confirmError')),
    });
  }
}
