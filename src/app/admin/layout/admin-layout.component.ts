import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AdminAuthService } from '../core/services/admin-auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell" [class.sidebar-open]="isSidebarOpen()">
      <div class="background-orb orb-left"></div>
      <div class="background-orb orb-right"></div>
      <button
        type="button"
        class="mobile-backdrop"
        [class.visible]="isSidebarOpen()"
        [attr.aria-hidden]="!isSidebarOpen()"
        (click)="closeSidebar()"
      ></button>

      <aside class="sidebar glass-panel">
        <div class="sidebar-head">
          <div class="brand-block">
            <div class="brand-mark">EM</div>
            <div>
              <div class="brand-title">EL MOSTAFA</div>
              <div class="brand-subtitle">{{ lang.translate('admin.brand.cms') }}</div>
            </div>
          </div>

          <button
            type="button"
            class="sidebar-close"
            (click)="closeSidebar()"
            [attr.aria-label]="lang.translate('admin.aria.closeNavigation')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6L18 18" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <p class="sidebar-copy">
          {{ lang.translate('admin.sidebar.manage') }}
        </p>

        <nav class="nav-list">
          <div class="nav-group" *ngFor="let group of navGroups()">
            <div class="nav-group-title" *ngIf="group.title">{{ group.title }}</div>
            <a
              *ngFor="let item of group.items"
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
              (click)="closeSidebar()"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="footer-link" (click)="closeSidebar()">{{
            lang.translate('admin.sidebar.viewPortfolio')
          }}</a>
          <button type="button" class="footer-link logout" (click)="logout()">
            {{ lang.translate('admin.sidebar.logout') }}
          </button>
        </div>
      </aside>

      <section class="content-shell">
        <header class="topbar glass-panel">
          <div class="topbar-main">
            <button
              type="button"
              class="sidebar-toggle"
              (click)="toggleSidebar()"
              [attr.aria-expanded]="isSidebarOpen()"
              [attr.aria-label]="lang.translate('admin.aria.toggleNavigation')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7H20" />
                <path d="M4 12H20" />
                <path d="M4 17H20" />
              </svg>
            </button>

            <div class="topbar-copy">
              <div class="topbar-title">{{ lang.translate('admin.title') }}</div>
              <div class="topbar-subtitle">
                {{ lang.translate('admin.subtitle') }}
              </div>
            </div>
          </div>

          <div class="header-actions">
            <!-- Theme + Language Toggles -->
            <div class="toggle-group glass-panel">
              <!-- Theme Toggle (SVG icons, same as portfolio navbar) -->
              <button
                type="button"
                class="icon-btn"
                (click)="theme.toggleTheme()"
                [title]="
                  theme.isDarkMode()
                    ? lang.translate('admin.theme.switchToLight')
                    : lang.translate('admin.theme.switchToDark')
                "
              >
                <span class="btn-icon" [class.rotate]="theme.isDarkMode()">
                  @if (theme.isDarkMode()) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  }
                </span>
              </button>

              <!-- Language Toggle (same as portfolio navbar) -->
              <button type="button" class="lang-btn" (click)="lang.toggleLanguage()">
                <span class="lang-code">{{ lang.currentLang() === 'en' ? 'AR' : 'EN' }}</span>
              </button>
            </div>

            <!-- Admin Chip -->
            <div class="admin-chip glass-panel">
              <div class="chip-avatar">A</div>
              <div>
                <div class="chip-name">{{ adminName() }}</div>
                <div class="chip-email">{{ adminEmail() }}</div>
              </div>
            </div>
          </div>
        </header>

        <main class="page-host">
          <router-outlet></router-outlet>
        </main>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        color: var(--text-primary);
        background-color: var(--bg-primary);
        background-image:
          radial-gradient(circle at top left, rgba(245, 124, 0, 0.12), transparent 35%),
          radial-gradient(circle at bottom right, rgba(211, 47, 47, 0.1), transparent 35%);
        transition: background-color 0.5s ease;
      }

      .admin-shell {
        position: relative;
        min-height: 100vh;
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        gap: 24px;
        padding: 24px;
        overflow: hidden;
        align-items: start;
      }

      .background-orb {
        position: absolute;
        width: 420px;
        height: 420px;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.4;
        pointer-events: none;
      }

      .orb-left {
        top: -140px;
        left: -120px;
        background: rgba(245, 124, 0, 0.15);
      }

      .orb-right {
        right: -160px;
        bottom: -100px;
        background: rgba(211, 47, 47, 0.12);
      }

      .glass-panel {
        background: var(--glass-bg);
        border: 1px solid var(--border-color);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }

      .sidebar {
        position: relative;
        z-index: 1;
        border-radius: 30px;
        display: flex;
        flex-direction: column;
        padding: 24px 20px;
        min-height: calc(100vh - 48px);
        max-height: calc(100vh - 48px);
        position: sticky;
        top: 24px;
        overflow: hidden;
      }

      .sidebar-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
      }

      .brand-block {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .brand-mark {
        width: 56px;
        height: 56px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        color: #fff;
        font-weight: 900;
        letter-spacing: 0.08em;
        flex-shrink: 0;
      }

      .brand-title {
        font-family: var(--font-display);
        font-size: 1.05rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        color: var(--text-primary);
      }

      .brand-subtitle {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }

      .sidebar-copy {
        margin: 18px 0 0;
        line-height: 1.7;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      .nav-list {
        display: grid;
        gap: 16px;
        margin: 26px 0 0;
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding-inline-end: 4px;
      }

      .nav-group {
        display: grid;
        gap: 6px;
      }

      .nav-group-title {
        padding: 0 12px 4px;
        color: var(--text-secondary);
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 18px;
        text-decoration: none;
        color: var(--text-secondary);
        border: 1px solid transparent;
        font-weight: 600;
        font-size: 0.9rem;
        transition:
          transform 0.25s ease,
          background 0.25s ease,
          border-color 0.25s ease,
          color 0.25s ease;
      }

      .nav-item:hover,
      .nav-item.active {
        transform: translateX(4px);
        color: var(--text-primary);
        border-color: rgba(245, 124, 0, 0.26);
        background: linear-gradient(135deg, rgba(245, 124, 0, 0.12), rgba(211, 47, 47, 0.06));
      }

      [dir='rtl'] .nav-item:hover,
      [dir='rtl'] .nav-item.active {
        transform: translateX(-4px);
      }

      .nav-icon {
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: var(--border-color);
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--text-primary);
        flex-shrink: 0;
      }

      .sidebar-footer {
        margin-top: 18px;
        display: grid;
        gap: 10px;
        padding-top: 20px;
        border-top: 1px solid var(--border-color);
      }

      .footer-link {
        border: 1px solid var(--border-color);
        background: transparent;
        color: var(--text-secondary);
        border-radius: 16px;
        padding: 13px 14px;
        text-decoration: none;
        text-align: start;
        cursor: pointer;
        font: inherit;
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .footer-link:hover {
        background: var(--border-color);
        color: var(--text-primary);
      }

      .footer-link.logout {
        color: #e84057;
      }

      .footer-link.logout:hover {
        background: rgba(232, 64, 87, 0.1);
        border-color: rgba(232, 64, 87, 0.3);
      }

      .content-shell {
        position: relative;
        z-index: 1;
        min-width: 0;
      }

      .topbar-main {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
      }

      .topbar-copy {
        min-width: 0;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 18px;
        border-radius: 28px;
        padding: 16px 24px;
        margin-bottom: 22px;
      }

      .topbar-title {
        font-family: var(--font-display);
        font-size: clamp(1.2rem, 2vw, 1.7rem);
        font-weight: 800;
        color: var(--text-primary);
      }

      .topbar-subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-shrink: 0;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      /* Toggle group — identical pattern to the portfolio navbar */
      .toggle-group {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 5px;
        border-radius: 100px;
      }

      .icon-btn,
      .lang-btn {
        background: transparent;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.3s ease;
      }

      .icon-btn:hover,
      .lang-btn:hover {
        background: var(--border-color);
        transform: translateY(-2px);
      }

      .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.5s ease;
      }

      .btn-icon.rotate {
        animation: spinOnce 0.5s ease;
      }

      @keyframes spinOnce {
        from {
          transform: rotate(-30deg);
        }
        to {
          transform: rotate(0deg);
        }
      }

      .btn-icon svg {
        width: 18px;
        height: 18px;
      }

      .lang-code {
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 1px;
        min-width: 24px;
        text-align: center;
        color: var(--text-secondary);
      }

      .lang-btn:hover .lang-code {
        color: var(--color-primary);
      }

      /* Admin chip */
      .admin-chip {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 999px;
        min-width: 0;
      }

      .chip-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        color: #fff;
        font-weight: 800;
        font-size: 0.85rem;
        flex-shrink: 0;
      }

      .chip-name {
        font-weight: 700;
        font-size: 0.88rem;
        color: var(--text-primary);
        white-space: nowrap;
      }

      .chip-email {
        font-size: 0.75rem;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .admin-chip > div {
        min-width: 0;
      }

      .page-host {
        min-width: 0;
        min-height: calc(100vh - 150px);
      }

      .sidebar-toggle,
      .sidebar-close,
      .mobile-backdrop {
        display: none;
      }

      .sidebar-toggle,
      .sidebar-close {
        border: 1px solid var(--border-color);
        background: transparent;
        color: var(--text-primary);
        width: 46px;
        height: 46px;
        border-radius: 16px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
          background 0.25s ease,
          border-color 0.25s ease,
          transform 0.25s ease;
        flex-shrink: 0;
      }

      .sidebar-toggle:hover,
      .sidebar-close:hover {
        background: var(--border-color);
        transform: translateY(-1px);
      }

      .sidebar-toggle svg,
      .sidebar-close svg {
        width: 20px;
        height: 20px;
      }

      @media (max-width: 1100px) {
        .admin-shell {
          display: block;
          padding: 20px;
        }

        .mobile-backdrop {
          display: block;
          position: fixed;
          inset: 0;
          z-index: 11;
          border: 0;
          background: rgba(15, 15, 15, 0.52);
          backdrop-filter: blur(8px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }

        .mobile-backdrop.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .sidebar {
          position: fixed;
          top: 16px;
          bottom: 16px;
          inset-inline-start: 16px;
          width: min(320px, calc(100vw - 32px));
          min-height: auto;
          max-height: calc(100vh - 32px);
          z-index: 20;
          transform: translateX(calc(-100% - 24px));
          transition: transform 0.28s ease;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.28);
        }

        [dir='rtl'] .sidebar {
          transform: translateX(calc(100% + 24px));
        }

        .admin-shell.sidebar-open .sidebar {
          transform: translateX(0);
        }

        .sidebar-toggle,
        .sidebar-close {
          display: inline-flex;
        }

        .topbar {
          position: sticky;
          top: 16px;
          z-index: 10;
        }
      }

      @media (max-width: 780px) {
        .admin-shell {
          padding: 16px;
          gap: 16px;
        }

        .topbar {
          display: grid;
          gap: 16px;
          border-radius: 24px;
          padding: 18px;
        }

        .header-actions {
          width: 100%;
          justify-content: space-between;
        }

        .admin-chip {
          width: 100%;
          border-radius: 22px;
        }
      }

      @media (max-width: 560px) {
        .sidebar {
          top: 12px;
          bottom: 12px;
          inset-inline-start: 12px;
          width: calc(100vw - 24px);
          max-height: calc(100vh - 24px);
          border-radius: 26px;
        }

        .brand-mark {
          width: 50px;
          height: 50px;
          border-radius: 16px;
        }

        .topbar-main {
          width: 100%;
          align-items: flex-start;
        }

        .topbar-subtitle {
          line-height: 1.6;
        }

        .header-actions {
          gap: 10px;
        }

        .toggle-group,
        .admin-chip {
          width: 100%;
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly lang = inject(LanguageService);
  readonly theme = inject(ThemeService);
  readonly isSidebarOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeSidebar());
  }

  readonly navGroups = computed(() => [
    {
      title: '',
      items: [
        {
          label: this.lang.translate('admin.nav.dashboard'),
          route: '/admin/dashboard',
          icon: 'OV',
        },
      ],
    },
    {
      title: this.lang.translate('admin.navGroups.website'),
      items: [
        {
          label: this.lang.translate('admin.nav.visualEditor'),
          route: '/admin/visual-editor',
          icon: 'EW',
        },
        {
          label: this.lang.translate('admin.nav.siteContent'),
          route: '/admin/site-content',
          icon: 'TC',
        },
        {
          label: this.lang.translate('admin.nav.showcase'),
          route: '/admin/showcase',
          icon: 'HP',
        },
        {
          label: this.lang.translate('admin.nav.origins'),
          route: '/admin/origins',
          icon: 'SO',
        },
      ],
    },
    {
      title: this.lang.translate('admin.navGroups.catalogBlog'),
      items: [
        {
          label: this.lang.translate('admin.nav.catalogProducts'),
          route: '/admin/catalog-products',
          icon: 'PC',
        },
        {
          label: this.lang.translate('admin.nav.articles'),
          route: '/admin/articles',
          icon: 'BA',
        },
        {
          label: this.lang.translate('admin.nav.resources'),
          route: '/admin/resources',
          icon: 'CL',
        },
      ],
    },
    {
      title: this.lang.translate('admin.navGroups.leads'),
      items: [
        {
          label: this.lang.translate('admin.nav.quotes'),
          route: '/admin/quotes',
          icon: 'QR',
        },
        {
          label: this.lang.translate('admin.nav.messages'),
          route: '/admin/messages',
          icon: 'CM',
        },
        {
          label: this.lang.translate('admin.nav.newsletter'),
          route: '/admin/newsletter',
          icon: 'NS',
        },
      ],
    },
    {
      title: this.lang.translate('admin.navGroups.admin'),
      items: [
        {
          label: this.lang.translate('admin.nav.users'),
          route: '/admin/users',
          icon: 'TA',
        },
      ],
    },
  ]);

  readonly adminName = computed(
    () => this.auth.session()?.user.fullName ?? this.lang.translate('admin.user.fallbackName'),
  );
  readonly adminEmail = computed(() => this.auth.session()?.user.email ?? 'admin@local.dev');

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  logout(): void {
    this.closeSidebar();
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}
