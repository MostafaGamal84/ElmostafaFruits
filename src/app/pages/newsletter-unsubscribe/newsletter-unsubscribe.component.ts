import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewsletterApiService } from '../../core/services/newsletter-api.service';
import { LanguageService } from '../../core/services/language.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-newsletter-unsubscribe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page">
      <form [formGroup]="form" (ngSubmit)="unsubscribe()">
        <span>{{ lang.translate('pages.newsletterFlow.unsubscribeEyebrow') }}</span>
        <h1>{{ lang.translate('pages.newsletterFlow.unsubscribeTitle') }}</h1>
        <input
          formControlName="emailOrToken"
          [placeholder]="lang.translate('pages.newsletterFlow.unsubscribePlaceholder')"
        />
        <button type="submit" [disabled]="form.invalid || saving()">
          {{
            saving()
              ? lang.translate('pages.newsletterFlow.unsubscribeSubmitting')
              : lang.translate('pages.newsletterFlow.unsubscribeSubmit')
          }}
        </button>
        <p *ngIf="status()">{{ status() }}</p>
        <a routerLink="/">{{ lang.translate('pages.common.backToPortfolio') }}</a>
      </form>
    </main>
    <app-footer></app-footer>
  `,
  styles: [
    `
      .page {
        min-height: 70vh;
        display: grid;
        place-content: center;
        padding: 120px 20px 70px;
      }

      form {
        width: min(520px, calc(100vw - 40px));
        display: grid;
        gap: 12px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        border-radius: 8px;
        padding: 22px;
      }

      span,
      p,
      a {
        color: var(--color-primary);
        font-weight: 800;
      }

      h1 {
        color: var(--text-primary);
        margin: 0;
      }

      input {
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-primary);
        border-radius: 6px;
        padding: 12px 14px;
        font: inherit;
      }

      button {
        border: 0;
        border-radius: 6px;
        padding: 12px 14px;
        background: var(--color-primary);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }
    `,
  ],
})
export class NewsletterUnsubscribeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly newsletterApi = inject(NewsletterApiService);
  readonly lang = inject(LanguageService);

  readonly saving = signal(false);
  readonly status = signal('');
  readonly form = this.fb.nonNullable.group({
    emailOrToken: ['', Validators.required],
  });

  unsubscribe(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.newsletterApi.unsubscribe(this.form.getRawValue()).subscribe({
      next: () => {
        this.status.set(this.lang.translate('pages.newsletterFlow.unsubscribeSuccess'));
        this.form.reset();
        this.saving.set(false);
      },
      error: () => {
        this.status.set(this.lang.translate('pages.newsletterFlow.unsubscribeError'));
        this.saving.set(false);
      },
    });
  }
}
