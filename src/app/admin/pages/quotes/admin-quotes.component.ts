import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Quote } from '../../../core/models/quote.model';
import { LanguageService } from '../../../core/services/language.service';
import { QuotesApiService } from '../../../core/services/quotes-api.service';

type QuoteStatusValue = 0 | 1 | 2 | 3;

@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow">{{ copy().eyebrow }}</span>
          <h2>{{ copy().title }}</h2>
          <p>{{ copy().description }}</p>
        </div>

        <div class="head-actions">
          <button type="button" class="ghost" (click)="load()">{{ copy().refresh }}</button>
          <button type="button" (click)="exportCsv()">{{ copy().export }}</button>
        </div>
      </div>

      <div class="stats-grid">
        <article class="stat-card" *ngFor="let stat of stats()">
          <span>{{ stat.label }}</span>
          <strong>{{ stat.value }}</strong>
        </article>
      </div>

      <section class="filter-panel">
        <div class="filters">
          <input
            [(ngModel)]="search"
            [placeholder]="copy().searchPlaceholder"
            (keydown.enter)="load()"
          />

          <select [(ngModel)]="status">
            <option [ngValue]="undefined">{{ copy().allStatuses }}</option>
            <option *ngFor="let option of statusOptions" [ngValue]="option">
              {{ statusLabel(option) }}
            </option>
          </select>

          <input type="date" [(ngModel)]="from" />
          <input type="date" [(ngModel)]="to" />

          <button type="button" class="ghost" (click)="resetFilters()">{{ copy().reset }}</button>
          <button type="button" (click)="load()">{{ copy().apply }}</button>
        </div>

        <p class="results-meta">{{ resultsSummary() }}</p>
      </section>

      <div *ngIf="loading()" class="state-card">{{ copy().loading }}</div>
      <div *ngIf="!loading() && quotes().length === 0" class="state-card">{{ copy().empty }}</div>

      <section class="workspace" *ngIf="!loading() && quotes().length > 0">
        <div class="list-panel">
          <article
            class="quote-card"
            *ngFor="let quote of quotes(); trackBy: trackQuote"
            [class.active]="selectedQuote()?.id === quote.id"
            (click)="selectQuote(quote)"
          >
            <div class="quote-top">
              <div>
                <h3>{{ quote.fullName }}</h3>
                <p class="quote-subline">
                  {{ quote.company || copy().notProvided }}
                  <span class="divider">&middot;</span>
                  {{ quote.country || copy().notProvided }}
                </p>
              </div>

              <span class="status-badge" [ngClass]="'status-' + statusKey(quote.status)">
                {{ statusLabel(quote.status) }}
              </span>
            </div>

            <div class="meta-chips">
              <span class="chip">{{ formatDate(quote.createdAt) }}</span>
              <span class="chip" *ngIf="quote.productSlug">{{ humanizeSlug(quote.productSlug) }}</span>
              <span class="chip" *ngIf="quote.quantity">{{ quote.quantity }}</span>
              <span class="chip locale" *ngIf="quote.locale">{{ localeLabel(quote.locale) }}</span>
            </div>

            <div class="contact-row">
              <a
                class="link-chip"
                [href]="'mailto:' + quote.email"
                (click)="$event.stopPropagation()"
              >
                {{ quote.email }}
              </a>

              <a
                *ngIf="quote.phone"
                class="link-chip"
                [href]="'tel:' + phoneLink(quote.phone)"
                (click)="$event.stopPropagation()"
              >
                {{ quote.phone }}
              </a>
            </div>

            <p class="message-preview">
              {{ quote.message || copy().noMessage }}
            </p>
          </article>
        </div>

        <aside class="detail-panel" *ngIf="selectedQuote() as quote">
          <div class="detail-head">
            <div>
              <span class="eyebrow">{{ copy().reference }} #{{ quote.id }}</span>
              <h3>{{ quote.fullName }}</h3>
              <p>{{ copy().received }} {{ formatDate(quote.createdAt) }}</p>
            </div>

            <select
              class="status-select"
              [ngModel]="quote.status"
              (ngModelChange)="updateStatus(quote, $event)"
            >
              <option *ngFor="let option of statusOptions" [ngValue]="option">
                {{ statusLabel(option) }}
              </option>
            </select>
          </div>

          <div class="detail-list">
            <article class="detail-row">
              <span>{{ copy().companyLabel }}</span>
              <strong>{{ quote.company || copy().notProvided }}</strong>
            </article>

            <article class="detail-row">
              <span>{{ copy().countryLabel }}</span>
              <strong>{{ quote.country || copy().notProvided }}</strong>
            </article>

            <article class="detail-row important">
              <span>{{ copy().emailLabel }}</span>
              <a [href]="'mailto:' + quote.email">{{ quote.email }}</a>
            </article>

            <article class="detail-row important">
              <span>{{ copy().phoneLabel }}</span>
              <a *ngIf="quote.phone; else noPhone" [href]="'tel:' + phoneLink(quote.phone)">
                {{ quote.phone }}
              </a>
              <ng-template #noPhone>
                <strong>{{ copy().notProvided }}</strong>
              </ng-template>
            </article>

            <article class="detail-row">
              <span>{{ copy().productLabel }}</span>
              <strong>
                {{
                  quote.productSlug ? humanizeSlug(quote.productSlug) : copy().generalInquiry
                }}
              </strong>
            </article>

            <article class="detail-row">
              <span>{{ copy().quantityLabel }}</span>
              <strong>{{ quote.quantity || copy().notProvided }}</strong>
            </article>

            <article class="detail-row">
              <span>{{ copy().localeLabel }}</span>
              <strong>{{ localeLabel(quote.locale) }}</strong>
            </article>

            <article class="detail-row important" *ngIf="quote.attachmentUrl">
              <span>{{ copy().attachmentLabel }}</span>
              <a [href]="quote.attachmentUrl" target="_blank" rel="noopener noreferrer">
                {{ copy().attachmentAvailable }}
              </a>
            </article>
          </div>

          <div class="message-block">
            <h4>{{ copy().messageLabel }}</h4>
            <p>{{ quote.message || copy().noMessage }}</p>
          </div>

          <div class="detail-actions">
            <a class="action-btn" [href]="'mailto:' + quote.email">
              {{ copy().replyEmail }}
            </a>

            <a
              *ngIf="quote.phone"
              class="action-btn ghost-link"
              [href]="'tel:' + phoneLink(quote.phone)"
            >
              {{ copy().call }}
            </a>

            <a
              *ngIf="quote.attachmentUrl"
              class="action-btn ghost-link"
              [href]="quote.attachmentUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ copy().openAttachment }}
            </a>

            <button type="button" class="danger" (click)="remove(quote)">
              {{ copy().delete }}
            </button>
          </div>
        </aside>
      </section>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 18px;
      }

      .page-head,
      .head-actions,
      .filters,
      .quote-top,
      .contact-row,
      .detail-head,
      .detail-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .page-head,
      .quote-top,
      .detail-head {
        justify-content: space-between;
        align-items: flex-start;
      }

      .eyebrow {
        display: inline-block;
        margin-bottom: 10px;
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.78rem;
        font-weight: 800;
      }

      h2,
      h3,
      h4,
      p,
      strong,
      span {
        margin: 0;
      }

      h2,
      h3,
      h4,
      strong {
        color: var(--text-primary);
      }

      .page-head p,
      .results-meta,
      .quote-subline,
      .message-preview,
      .detail-head p,
      .message-block p,
      .detail-row span,
      .state-card {
        color: var(--text-secondary);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .stat-card,
      .filter-panel,
      .list-panel,
      .detail-panel,
      .state-card {
        border-radius: 26px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition:
          background 0.4s ease,
          border-color 0.4s ease,
          transform 0.25s ease;
      }

      .stat-card {
        padding: 18px;
        display: grid;
        gap: 8px;
      }

      .stat-card span {
        color: var(--text-secondary);
        font-size: 0.88rem;
      }

      .stat-card strong {
        font-size: clamp(1.6rem, 3vw, 2.2rem);
      }

      .filter-panel {
        padding: 18px;
        display: grid;
        gap: 14px;
      }

      .filters {
        align-items: center;
      }

      .filters input,
      .filters select,
      .status-select {
        min-width: 0;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-primary);
        border-radius: 16px;
        padding: 12px 14px;
        font: inherit;
      }

      .filters input,
      .filters select {
        flex: 1 1 180px;
      }

      button,
      .action-btn {
        border: 0;
        border-radius: 16px;
        padding: 12px 16px;
        background: var(--color-primary);
        color: #fff;
        font: inherit;
        font-weight: 800;
        text-decoration: none;
        cursor: pointer;
        transition:
          transform 0.22s ease,
          opacity 0.22s ease,
          background 0.22s ease;
      }

      button:hover,
      .action-btn:hover {
        transform: translateY(-1px);
      }

      .ghost,
      .ghost-link {
        background: var(--bg-surface);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }

      .danger {
        background: #d32f2f;
      }

      .results-meta {
        font-size: 0.9rem;
      }

      .workspace {
        display: grid;
        grid-template-columns: minmax(320px, 0.85fr) minmax(420px, 1fr);
        gap: 18px;
        align-items: start;
      }

      .list-panel,
      .detail-panel {
        padding: 18px;
      }

      .list-panel {
        display: grid;
        gap: 12px;
      }

      .quote-card {
        display: grid;
        gap: 12px;
        padding: 18px;
        border-radius: 22px;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        cursor: pointer;
        transition:
          border-color 0.24s ease,
          transform 0.24s ease,
          background 0.24s ease;
      }

      .quote-card:hover,
      .quote-card.active {
        border-color: rgba(245, 124, 0, 0.34);
        background: rgba(245, 124, 0, 0.05);
        transform: translateY(-1px);
      }

      .quote-card h3 {
        margin-bottom: 4px;
      }

      .quote-top > div,
      .contact-row {
        min-width: 0;
      }

      .contact-row {
        align-items: center;
      }

      .quote-subline {
        line-height: 1.6;
      }

      .divider {
        margin-inline: 6px;
        opacity: 0.65;
      }

      .meta-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .chip,
      .link-chip,
      .status-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 7px 11px;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .chip,
      .link-chip {
        min-width: 0;
        max-width: 100%;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        text-decoration: none;
      }

      .link-chip {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .locale {
        color: var(--color-primary);
      }

      .status-badge {
        white-space: nowrap;
        color: #fff;
      }

      .status-new {
        background: linear-gradient(135deg, #f57c00, #ff9800);
      }

      .status-in-progress {
        background: linear-gradient(135deg, #1565c0, #1976d2);
      }

      .status-closed {
        background: linear-gradient(135deg, #2e7d32, #43a047);
      }

      .status-archived {
        background: linear-gradient(135deg, #5f6368, #757575);
      }

      .message-preview,
      .message-block p {
        line-height: 1.8;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .detail-panel {
        display: grid;
        gap: 18px;
        position: sticky;
        top: 18px;
        min-width: 0;
      }

      .status-select {
        min-width: 190px;
      }

      .detail-list {
        display: grid;
        gap: 8px;
      }

      .detail-row,
      .message-block {
        border-radius: 14px;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
      }

      .detail-row {
        min-width: 0;
        display: grid;
        grid-template-columns: minmax(92px, 0.36fr) minmax(0, 1fr);
        gap: 12px;
        align-items: center;
        padding: 13px 16px;
      }

      .detail-row.important {
        background: rgba(255, 255, 255, 0.035);
      }

      .detail-row span {
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-secondary);
      }

      .detail-row strong,
      .detail-row a {
        min-width: 0;
        color: var(--text-primary);
        font-weight: 800;
        text-decoration: none;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .message-block {
        padding: 18px;
        display: grid;
        gap: 12px;
      }

      .state-card {
        padding: 48px 24px;
        text-align: center;
        font-size: 1rem;
      }

      @media (max-width: 1180px) {
        .stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .workspace {
          grid-template-columns: 1fr;
        }

        .detail-panel {
          position: static;
        }
      }

      @media (max-width: 760px) {
        .page-head,
        .filters,
        .quote-top,
        .detail-head,
        .detail-actions {
          display: grid;
          grid-template-columns: 1fr;
        }

        .head-actions {
          width: 100%;
        }

        .head-actions button,
        .filters button,
        .action-btn,
        .danger {
          width: 100%;
          justify-content: center;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }

        .detail-row {
          grid-template-columns: 1fr;
          gap: 6px;
        }

        .quote-card,
        .list-panel,
        .detail-panel,
        .filter-panel,
        .stat-card {
          border-radius: 22px;
        }
      }
    `,
  ],
})
export class AdminQuotesComponent implements OnInit {
  private readonly quotesApi = inject(QuotesApiService);
  readonly lang = inject(LanguageService);

  readonly quotes = signal<Quote[]>([]);
  readonly selectedQuote = signal<Quote | null>(null);
  readonly loading = signal(true);
  readonly totalResults = signal(0);

  readonly statusOptions: QuoteStatusValue[] = [0, 1, 2, 3];

  search = '';
  status?: QuoteStatusValue;
  from = '';
  to = '';

  readonly copy = computed(() =>
    this.lang.currentLang() === 'ar'
      ? {
          eyebrow: 'عروض الأسعار',
          title: 'طلبات التسعير',
          description: 'تابع الطلبات الواردة، راجع بيانات العميل سريعًا، ورد مباشرة من نفس الشاشة.',
          refresh: 'تحديث',
          export: 'تصدير CSV',
          searchPlaceholder: 'ابحث بالاسم أو الشركة أو البريد',
          allStatuses: 'كل الحالات',
          reset: 'إعادة ضبط',
          apply: 'تطبيق',
          loading: 'جاري تحميل طلبات التسعير...',
          empty: 'لا توجد طلبات مطابقة للفلاتر الحالية.',
          reference: 'مرجع الطلب',
          received: 'تم الاستلام في',
          companyLabel: 'الشركة',
          countryLabel: 'الدولة',
          emailLabel: 'البريد الإلكتروني',
          phoneLabel: 'الهاتف',
          productLabel: 'المنتج',
          quantityLabel: 'الكمية',
          localeLabel: 'اللغة',
          attachmentLabel: 'المرفق',
          attachmentAvailable: 'يوجد مرفق',
          messageLabel: 'رسالة العميل',
          replyEmail: 'الرد عبر البريد',
          call: 'اتصال',
          openAttachment: 'فتح المرفق',
          delete: 'حذف الطلب',
          noMessage: 'لا توجد رسالة مرفقة مع هذا الطلب.',
          notProvided: 'غير متوفر',
          generalInquiry: 'استفسار عام',
          statusLabels: ['جديد', 'قيد المتابعة', 'مغلق', 'مؤرشف'],
          stats: {
            total: 'إجمالي النتائج',
            fresh: 'طلبات جديدة',
            active: 'قيد المتابعة',
            closed: 'مغلقة',
          },
          results: {
            zero: 'لا توجد نتائج',
            one: 'طلب واحد ظاهر',
            many: (count: number) => `${count} طلب ظاهر`,
          },
          confirmDelete: 'هل تريد حذف طلب التسعير هذا؟',
        }
      : {
          eyebrow: 'Quotes',
          title: 'Quote Requests',
          description:
            'Track incoming quote requests, review buyer details quickly, and reply from one cleaner workspace.',
          refresh: 'Refresh',
          export: 'Export CSV',
          searchPlaceholder: 'Search by name, company, or email',
          allStatuses: 'All statuses',
          reset: 'Reset',
          apply: 'Apply',
          loading: 'Loading quote requests...',
          empty: 'No quote requests match the current filters.',
          reference: 'Request',
          received: 'Received on',
          companyLabel: 'Company',
          countryLabel: 'Country',
          emailLabel: 'Email',
          phoneLabel: 'Phone',
          productLabel: 'Product',
          quantityLabel: 'Quantity',
          localeLabel: 'Language',
          attachmentLabel: 'Attachment',
          attachmentAvailable: 'Attachment available',
          messageLabel: 'Customer message',
          replyEmail: 'Reply by email',
          call: 'Call',
          openAttachment: 'Open attachment',
          delete: 'Delete',
          noMessage: 'No message was added to this request.',
          notProvided: 'Not provided',
          generalInquiry: 'General inquiry',
          statusLabels: ['New', 'In Progress', 'Closed', 'Archived'],
          stats: {
            total: 'Visible results',
            fresh: 'New requests',
            active: 'In progress',
            closed: 'Closed',
          },
          results: {
            zero: 'No results',
            one: '1 request shown',
            many: (count: number) => `${count} requests shown`,
          },
          confirmDelete: 'Delete this quote request?',
        },
  );

  readonly stats = computed(() => [
    { label: this.copy().stats.total, value: this.totalResults() },
    { label: this.copy().stats.fresh, value: this.countByStatus(0) },
    { label: this.copy().stats.active, value: this.countByStatus(1) },
    { label: this.copy().stats.closed, value: this.countByStatus(2) },
  ]);

  readonly dateFormatter = computed(
    () =>
      new Intl.DateTimeFormat(this.lang.currentLang() === 'ar' ? 'ar-EG' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const previousSelectionId = this.selectedQuote()?.id;
    this.loading.set(true);

    this.quotesApi
      .getQuotes({
        search: this.search || undefined,
        status: this.status,
        from: this.from || undefined,
        to: this.to || undefined,
        page: 1,
        pageSize: 100,
      })
      .subscribe({
        next: (response) => {
          const items = response.items ?? [];
          this.quotes.set(items);
          this.totalResults.set(response.total ?? items.length);
          this.restoreSelection(items, previousSelectionId);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load quotes', error);
          this.quotes.set([]);
          this.totalResults.set(0);
          this.selectedQuote.set(null);
          this.loading.set(false);
        },
      });
  }

  selectQuote(quote: Quote): void {
    this.selectedQuote.set(quote);
  }

  updateStatus(quote: Quote, status: QuoteStatusValue): void {
    this.quotesApi.updateStatus(quote.id, { status }).subscribe({
      next: () => this.load(),
      error: (error) => console.error('Failed to update quote status', error),
    });
  }

  remove(quote: Quote): void {
    if (!confirm(this.copy().confirmDelete)) {
      return;
    }

    this.quotesApi.deleteQuote(quote.id).subscribe({
      next: () => this.load(),
      error: (error) => console.error('Failed to delete quote', error),
    });
  }

  exportCsv(): void {
    this.quotesApi
      .exportCsv({
        search: this.search || undefined,
        status: this.status,
        from: this.from || undefined,
        to: this.to || undefined,
      })
      .subscribe({
        next: (blob) => this.download(blob, 'quotes.csv'),
        error: (error) => console.error('Failed to export quotes', error),
      });
  }

  resetFilters(): void {
    this.search = '';
    this.status = undefined;
    this.from = '';
    this.to = '';
    this.load();
  }

  resultsSummary(): string {
    const count = this.totalResults();

    if (count === 0) {
      return this.copy().results.zero;
    }

    if (count === 1) {
      return this.copy().results.one;
    }

    return this.copy().results.many(count);
  }

  statusLabel(status: number): string {
    return this.copy().statusLabels[status] ?? String(status);
  }

  statusKey(status: number): string {
    switch (status) {
      case 0:
        return 'new';
      case 1:
        return 'in-progress';
      case 2:
        return 'closed';
      default:
        return 'archived';
    }
  }

  localeLabel(locale?: string): string {
    return (locale ?? '').toLowerCase() === 'ar' ? 'AR' : 'EN';
  }

  humanizeSlug(value: string): string {
    return value
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  formatDate(value: string): string {
    return this.dateFormatter().format(new Date(value));
  }

  phoneLink(value: string): string {
    return value.replace(/[^\d+]/g, '');
  }

  trackQuote = (_: number, quote: Quote): number => quote.id;

  private countByStatus(status: QuoteStatusValue): number {
    return this.quotes().filter((quote) => quote.status === status).length;
  }

  private restoreSelection(items: Quote[], preferredId?: number): void {
    if (items.length === 0) {
      this.selectedQuote.set(null);
      return;
    }

    const selected = items.find((item) => item.id === preferredId) ?? items[0];
    this.selectedQuote.set(selected);
  }

  private download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
