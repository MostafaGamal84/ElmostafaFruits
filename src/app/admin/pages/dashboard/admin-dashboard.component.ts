import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PortfolioProductsApiService } from '../../../core/services/portfolio-products-api.service';
import { OriginsApiService } from '../../../core/services/origins-api.service';
import { MessagesApiService } from '../../../core/services/messages-api.service';
import { QuotesApiService } from '../../../core/services/quotes-api.service';
import { CatalogProductsApiService } from '../../../core/services/catalog-products-api.service';
import { LanguageService } from '../../../core/services/language.service';

interface DashboardAction {
  title: string;
  description: string;
  route: string;
  primary?: boolean;
}

interface WebsiteArea {
  title: string;
  description: string;
  route: string;
  meta: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-grid">
      <div class="stats-grid">
        <a class="stat-card" routerLink="/admin/messages">
          <span>{{ lang.translate('admin.dashboard.stats.unreadMessages.title') }}</span>
          <strong>{{ unreadMessages() }}</strong>
          <small>{{ lang.translate('admin.dashboard.stats.unreadMessages.description') }}</small>
        </a>

        <a class="stat-card" routerLink="/admin/quotes">
          <span>{{ lang.translate('admin.dashboard.stats.newQuotes.title') }}</span>
          <strong>{{ newQuotes() }}</strong>
          <small>{{ lang.translate('admin.dashboard.stats.newQuotes.description') }}</small>
        </a>

        <a class="stat-card" routerLink="/admin/showcase">
          <span>{{ lang.translate('admin.dashboard.stats.liveShowcaseItems.title') }}</span>
          <strong>{{ liveShowcaseCount() }}</strong>
          <small>
            {{
              totalProducts() +
                ' ' +
                lang.translate('admin.dashboard.stats.liveShowcaseItems.description')
            }}
          </small>
        </a>

        <a class="stat-card" routerLink="/admin/catalog-products">
          <span>{{ lang.translate('admin.dashboard.stats.catalogProducts.title') }}</span>
          <strong>{{ catalogProducts() }}</strong>
          <small>{{ lang.translate('admin.dashboard.stats.catalogProducts.description') }}</small>
        </a>
      </div>

      <div class="panel-grid">
        <section class="panel">
          <div class="panel-head">
            <div>
              <h3>{{ lang.translate('admin.dashboard.primaryActions.title') }}</h3>
              <p>{{ lang.translate('admin.dashboard.primaryActions.description') }}</p>
            </div>
          </div>

          <div class="actions primary-actions">
            <a
              class="action-card"
              [class.primary-action]="action.primary"
              *ngFor="let action of primaryActions()"
              [routerLink]="action.route"
            >
              <strong>{{ action.title }}</strong>
              <span>{{ action.description }}</span>
            </a>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h3>{{ lang.translate('admin.dashboard.websiteAreas.title') }}</h3>
              <p>{{ lang.translate('admin.dashboard.websiteAreas.description') }}</p>
            </div>
          </div>

          <div class="section-list">
            <a class="section-row" *ngFor="let area of websiteAreas()" [routerLink]="area.route">
              <div>
                <div class="row-title">{{ area.title }}</div>
                <div class="row-meta">{{ area.description }}</div>
              </div>
              <span class="badge">{{ area.meta }}</span>
            </a>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [
    `
      .page-grid {
        display: grid;
        gap: 20px;
      }

      .stat-card,
      .panel {
        border-radius: 24px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      h3,
      p {
        margin: 0;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .stat-card {
        display: grid;
        gap: 8px;
        min-height: 150px;
        padding: 20px;
        color: inherit;
        text-decoration: none;
        transition:
          transform 0.25s ease,
          border-color 0.25s ease,
          background 0.25s ease;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        border-color: rgba(245, 124, 0, 0.35);
        background: rgba(245, 124, 0, 0.04);
      }

      .stat-card span {
        color: var(--text-secondary);
        font-size: 0.86rem;
        font-weight: 700;
      }

      .stat-card strong {
        color: var(--text-primary);
        font-size: clamp(2rem, 4vw, 2.7rem);
        line-height: 1;
      }

      .stat-card small,
      .panel-head p,
      .row-meta,
      .action-card span {
        color: var(--text-secondary);
      }

      .panel-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(360px, 0.72fr);
        gap: 18px;
      }

      .panel {
        padding: 22px;
      }

      .panel-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 18px;
      }

      .panel-head h3 {
        color: var(--text-primary);
        font-size: 1.1rem;
      }

      .actions,
      .section-list {
        display: grid;
        gap: 12px;
      }

      .primary-actions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .action-card,
      .section-row {
        border-radius: 18px;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: inherit;
        text-decoration: none;
        transition:
          transform 0.25s ease,
          border-color 0.25s ease,
          background 0.25s ease;
      }

      .action-card {
        display: grid;
        gap: 8px;
        min-height: 118px;
        padding: 18px;
      }

      .action-card.primary-action {
        background: linear-gradient(135deg, rgba(245, 124, 0, 0.18), rgba(211, 47, 47, 0.08));
        border-color: rgba(245, 124, 0, 0.32);
      }

      .action-card:hover,
      .section-row:hover {
        transform: translateY(-2px);
        border-color: rgba(245, 124, 0, 0.35);
        background: rgba(245, 124, 0, 0.04);
      }

      .action-card strong,
      .row-title {
        color: var(--text-primary);
        font-weight: 800;
      }

      .section-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 14px;
        padding: 16px;
      }

      .row-title {
        margin-bottom: 5px;
      }

      .row-meta {
        line-height: 1.55;
      }

      .badge {
        padding: 5px 10px;
        border-radius: 999px;
        background: rgba(245, 124, 0, 0.12);
        color: var(--color-primary);
        font-size: 0.74rem;
        font-weight: 800;
        white-space: nowrap;
      }

      @media (max-width: 1180px) {
        .stats-grid,
        .primary-actions {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .panel-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .stats-grid,
        .primary-actions {
          grid-template-columns: 1fr;
        }

        .panel,
        .stat-card,
        .action-card,
        .section-row {
          border-radius: 18px;
        }

        .section-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  private readonly productsApi = inject(PortfolioProductsApiService);
  private readonly originsApi = inject(OriginsApiService);
  private readonly messagesApi = inject(MessagesApiService);
  private readonly quotesApi = inject(QuotesApiService);
  private readonly catalogProductsApi = inject(CatalogProductsApiService);
  readonly lang = inject(LanguageService);

  readonly primaryActions = computed<DashboardAction[]>(() => [
    {
      title: this.lang.translate('admin.dashboard.primaryActions.editWebsite.title'),
      description: this.lang.translate('admin.dashboard.primaryActions.editWebsite.description'),
      route: '/admin/visual-editor',
      primary: true,
    },
    {
      title: this.lang.translate('admin.dashboard.primaryActions.aboutUs.title'),
      description: this.lang.translate('admin.dashboard.primaryActions.aboutUs.description'),
      route: '/admin/site-content',
    },
    {
      title: this.lang.translate('admin.dashboard.primaryActions.homeProducts.title'),
      description: this.lang.translate('admin.dashboard.primaryActions.homeProducts.description'),
      route: '/admin/showcase',
    },
    {
      title: this.lang.translate('admin.dashboard.primaryActions.catalogProducts.title'),
      description: this.lang.translate(
        'admin.dashboard.primaryActions.catalogProducts.description',
      ),
      route: '/admin/catalog-products',
    },
    {
      title: this.lang.translate('admin.dashboard.primaryActions.leads.title'),
      description: this.lang.translate('admin.dashboard.primaryActions.leads.description'),
      route: '/admin/quotes',
    },
  ]);

  readonly websiteAreas = computed<WebsiteArea[]>(() => [
    {
      title: this.lang.translate('admin.dashboard.websiteAreas.homepage.title'),
      description: this.lang.translate('admin.dashboard.websiteAreas.homepage.description'),
      route: '/admin/visual-editor',
      meta: this.lang.translate('admin.dashboard.websiteAreas.homepage.meta'),
    },
    {
      title: this.lang.translate('admin.dashboard.websiteAreas.aboutUs.title'),
      description: this.lang.translate('admin.dashboard.websiteAreas.aboutUs.description'),
      route: '/admin/site-content',
      meta: this.lang.translate('admin.dashboard.websiteAreas.aboutUs.meta'),
    },
    {
      title: this.lang.translate('admin.dashboard.websiteAreas.catalog.title'),
      description: this.lang.translate('admin.dashboard.websiteAreas.catalog.description'),
      route: '/admin/catalog-products',
      meta: this.lang.translate('admin.dashboard.websiteAreas.catalog.meta'),
    },
    {
      title: this.lang.translate('admin.dashboard.websiteAreas.blog.title'),
      description: this.lang.translate('admin.dashboard.websiteAreas.blog.description'),
      route: '/admin/articles',
      meta: this.lang.translate('admin.dashboard.websiteAreas.blog.meta'),
    },
    {
      title: this.lang.translate('admin.dashboard.websiteAreas.leads.title'),
      description: this.lang.translate('admin.dashboard.websiteAreas.leads.description'),
      route: '/admin/messages',
      meta: this.lang.translate('admin.dashboard.websiteAreas.leads.meta'),
    },
  ]);

  readonly liveShowcaseCount = signal(0);
  readonly totalProducts = signal(0);
  readonly catalogProducts = signal(0);
  readonly originCount = signal(0);
  readonly unreadMessages = signal(0);
  readonly newQuotes = signal(0);

  ngOnInit(): void {
    this.refreshStats();
  }

  refreshStats(): void {
    forkJoin({
      products: this.productsApi.getProducts(),
      origins: this.originsApi.getOrigins(),
      messages: this.messagesApi.getMessages(),
      quotes: this.quotesApi.getQuotes({ status: 0, page: 1, pageSize: 1 }),
      catalogProducts: this.catalogProductsApi.getAdminProducts({ page: 1, pageSize: 1 }),
    }).subscribe({
      next: (res) => {
        this.totalProducts.set(res.products.length);
        this.liveShowcaseCount.set(res.products.filter((p) => p.status === 'Live').length);
        this.originCount.set(res.origins.length);
        this.unreadMessages.set(res.messages.filter((m) => m.status === 'New').length);
        this.newQuotes.set(res.quotes.total);
        this.catalogProducts.set(res.catalogProducts.total);
      },
      error: () => undefined,
    });
  }
}
