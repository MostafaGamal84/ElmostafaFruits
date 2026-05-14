import {
  Component,
  DestroyRef,
  HostListener,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { SiteContentService } from '../../core/services/site-content.service';
import { SiteSettingsService } from '../../core/services/site-settings.service';
import { resolveAssetUrl } from '../../core/utils/asset-url.util';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav
      [class.scrolled]="isScrolled || !isHomeRoute() || isMenuOpen()"
      [class.menu-open]="isMenuOpen()"
    >
      <div class="container nav-content">
        <a class="brand" href="/#home" (click)="navigateToSection('home', $event)">
          <div class="logo-wrapper">
            <img
              [src]="logoUrl()"
              alt="EL MOSTAFA"
              class="logo-img"
              data-edit-id="navbar.logo"
              data-edit-label="Navbar Logo"
              data-edit-type="image"
              data-edit-scope="global"
              (error)="onLogoError($event)"
              loading="eager"
              decoding="sync"
              fetchpriority="high"
            />
          </div>
        </a>

        <!-- Desktop Navigation -->
        <div class="desktop-nav d-none d-lg-flex align-items-center gap-4">
          <div class="links">
            <a href="/about-us" (click)="navigateToRoute('/about-us', $event)">
              <span
                data-edit-id="navbar.about"
                data-edit-label="Navbar About"
                [attr.data-edit-scope]="lang.currentLang()"
                >{{ content.getNavbarLabel('about', lang.currentLang()) }}</span
              >
            </a>
            <a href="/#origins" (click)="navigateToSection('origins', $event)">
              <span
                data-edit-id="navbar.origins"
                data-edit-label="Navbar Origins"
                [attr.data-edit-scope]="lang.currentLang()"
                >{{ content.getNavbarLabel('origins', lang.currentLang()) }}</span
              >
            </a>
            <a href="/catalog" (click)="navigateToRoute('/catalog', $event)"
              ><span
                data-edit-id="navbar.catalog"
                data-edit-label="Navbar Catalog"
                [attr.data-edit-scope]="lang.currentLang()"
                >{{ content.getNavbarLabel('catalog', lang.currentLang()) }}</span
              ></a
            >
            <a href="/blog" (click)="navigateToRoute('/blog', $event)"
              ><span
                data-edit-id="navbar.blog"
                data-edit-label="Navbar Blog"
                [attr.data-edit-scope]="lang.currentLang()"
                >{{ content.getNavbarLabel('blog', lang.currentLang()) }}</span
              ></a
            >
            <a href="/quote" (click)="navigateToRoute('/quote', $event)"
              ><span
                data-edit-id="navbar.quote"
                data-edit-label="Navbar Quote"
                [attr.data-edit-scope]="lang.currentLang()"
                >{{ content.getNavbarLabel('quote', lang.currentLang()) }}</span
              ></a
            >
            <a href="/#contact" (click)="navigateToSection('contact', $event)">
              <span
                data-edit-id="navbar.contact"
                data-edit-label="Navbar Contact"
                [attr.data-edit-scope]="lang.currentLang()"
                >{{ content.getNavbarLabel('contact', lang.currentLang()) }}</span
              >
            </a>
          </div>

          <div class="v-divider"></div>

          <!-- Toggles -->
          <div class="toggle-group" data-editor-ignore="true">
            <button
              class="icon-btn"
              (click)="toggleTheme($event)"
              [title]="theme.isDarkMode() ? 'Light Mode' : 'Dark Mode'"
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

            <button class="lang-btn" (click)="toggleLanguage($event)">
              <span class="lang-code">{{ lang.currentLang() === 'en' ? 'AR' : 'EN' }}</span>
            </button>
            <a
              class="admin-link"
              routerLink="/admin/login"
              [title]="content.getNavbarLabel('adminLink', lang.currentLang())"
              data-editor-ignore="true"
              (click)="blockEditorClick($event)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Mobile Controls -->
        <div
          class="mobile-actions d-flex d-lg-none align-items-center gap-2"
          data-editor-ignore="true"
        >
          <button class="icon-btn" (click)="toggleTheme($event)">
            <span class="btn-icon">
              @if (theme.isDarkMode()) {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5" />
                  <path
                    d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  />
                </svg>
              } @else {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              }
            </span>
          </button>
          <button class="lang-btn" (click)="toggleLanguage($event)">
            <span class="lang-code">{{ lang.currentLang() === 'en' ? 'AR' : 'EN' }}</span>
          </button>
          <button class="menu-toggle" (click)="toggleMenu($event)" [class.active]="isMenuOpen()">
            <span class="bar bar-1"></span>
            <span class="bar bar-2"></span>
            <span class="bar bar-3"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Overlay Menu -->
      <div class="mobile-overlay" [class.show]="isMenuOpen()">
        <div class="overlay-links">
          <a href="/about-us" (click)="navigateToRoute('/about-us', $event)">{{
            content.getNavbarLabel('about', lang.currentLang())
          }}</a>
          <a href="/#origins" (click)="navigateToSection('origins', $event)">{{
            content.getNavbarLabel('origins', lang.currentLang())
          }}</a>
          <a href="/catalog" (click)="navigateToRoute('/catalog', $event)"
            ><span
              data-edit-id="navbar.catalog"
              data-edit-label="Navbar Catalog"
              [attr.data-edit-scope]="lang.currentLang()"
              >{{ content.getNavbarLabel('catalog', lang.currentLang()) }}</span
            ></a
          >
          <a href="/blog" (click)="navigateToRoute('/blog', $event)"
            ><span
              data-edit-id="navbar.blog"
              data-edit-label="Navbar Blog"
              [attr.data-edit-scope]="lang.currentLang()"
              >{{ content.getNavbarLabel('blog', lang.currentLang()) }}</span
            ></a
          >
          <a href="/quote" (click)="navigateToRoute('/quote', $event)"
            ><span
              data-edit-id="navbar.quote"
              data-edit-label="Navbar Quote"
              [attr.data-edit-scope]="lang.currentLang()"
              >{{ content.getNavbarLabel('quote', lang.currentLang()) }}</span
            ></a
          >
          <a href="/#contact" (click)="navigateToSection('contact', $event)">{{
            content.getNavbarLabel('contact', lang.currentLang())
          }}</a>
          <a
            routerLink="/admin/login"
            (click)="closeMenuLink($event)"
            data-edit-id="navbar.adminLink"
            data-edit-label="Navbar Admin Login"
            [attr.data-edit-scope]="lang.currentLang()"
            data-editor-ignore="true"
            >{{ content.getNavbarLabel('adminLink', lang.currentLang()) }}</a
          >
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        padding: 1rem 0;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        background: transparent;
      }

      nav::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, var(--glass-bg), rgba(255, 255, 255, 0));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border-bottom: 1px solid transparent;
        opacity: 0.72;
        transition:
          opacity 0.35s ease,
          border-color 0.35s ease,
          background 0.35s ease;
        pointer-events: none;
      }

      nav.scrolled {
        padding: 0.7rem 0;
      }

      nav.scrolled::before,
      nav.menu-open::before {
        opacity: 1;
        background: linear-gradient(180deg, var(--glass-bg), var(--glass-bg));
        border-bottom-color: var(--border-color);
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.12);
      }

      .nav-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1002;
        min-height: 72px;
        gap: 16px;
      }

      .brand {
        display: flex;
        align-items: center;
        text-decoration: none;
      }

      .logo-wrapper {
        position: relative;
      }

      .logo-img {
        height: 58px;
        width: auto;
        display: block;
      }

      .brand:hover .logo-img {
        transform: none;
      }

      .v-divider {
        width: 1px;
        height: 24px;
        background: var(--border-color);
      }

      .desktop-nav {
        gap: 1.1rem;
        min-width: 0;
      }

      .toggle-group {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        background: var(--bg-surface);
        padding: 0.35rem;
        border-radius: 100px;
        border: 1px solid var(--border-color);
        margin-inline-start: 0.55rem;
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
        transition: all 0.3s ease;
        padding: 0.45rem;
        border-radius: 50%;
      }

      .admin-link {
        width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-primary);
        border-radius: 50%;
        text-decoration: none;
        transition: all 0.3s ease;
      }

      .admin-link:hover {
        background: var(--border-color);
        transform: translateY(-2px);
      }

      .admin-link svg {
        width: 18px;
        height: 18px;
      }

      .icon-btn:hover,
      .lang-btn:hover {
        background: var(--border-color);
        transform: translateY(-2px);
      }

      .btn-icon svg {
        width: 18px;
        height: 18px;
      }

      .lang-code {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 1px;
        min-width: 24px;
      }

      .links {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        min-width: 0;
      }
      .links a {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1.6px;
        position: relative;
        transition: color 0.3s ease;
        white-space: nowrap;
      }
      .links a:hover {
        color: var(--color-primary);
      }
      .links a::after {
        content: '';
        position: absolute;
        width: 0;
        height: 2px;
        bottom: -4px;
        left: 0;
        background-color: var(--color-primary);
        transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .links a:hover::after {
        width: 100%;
      }

      /* Hamburger Toggle */
      .menu-toggle {
        background: none;
        border: none;
        cursor: pointer;
        width: 42px;
        height: 42px;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        z-index: 1002;
        border-radius: 50%;
        transition: background 0.25s ease;
      }
      .menu-toggle:hover {
        background: var(--border-color);
      }
      .bar {
        width: 22px;
        height: 2px;
        background-color: var(--text-primary);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        border-radius: 2px;
      }
      .menu-toggle.active .bar-1 {
        transform: translateY(8px) rotate(45deg);
      }
      .menu-toggle.active .bar-2 {
        opacity: 0;
        transform: translateX(-10px);
      }
      .menu-toggle.active .bar-3 {
        transform: translateY(-8px) rotate(-45deg);
      }

      /* Mobile Overlay */
      .mobile-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100dvh;
        min-height: 100vh;
        background: var(--bg-primary);
        backdrop-filter: blur(30px);
        z-index: 1001;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 0.35s ease,
          visibility 0.35s ease;
        pointer-events: none;
        overflow-y: auto;
        padding: clamp(92px, 12dvh, 124px) clamp(20px, 6vw, 56px) 32px;
      }
      .mobile-overlay.show {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
      .overlay-links {
        width: min(520px, 100%);
        display: grid;
        gap: 0;
      }
      .overlay-links a {
        color: var(--text-primary);
        text-decoration: none;
        font-size: clamp(1.05rem, 3.2vw, 1.55rem);
        font-family: var(--font-display);
        font-weight: 700;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        opacity: 0;
        transform: translateY(16px);
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        min-height: clamp(48px, 7dvh, 62px);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-bottom: 1px solid var(--border-color);
      }
      .mobile-overlay.show .overlay-links a {
        opacity: 1;
        transform: translateY(0);
      }
      /* Staggered link animation */
      .mobile-overlay.show .overlay-links a:nth-child(1) {
        transition-delay: 0.1s;
      }
      .mobile-overlay.show .overlay-links a:nth-child(2) {
        transition-delay: 0.2s;
      }
      .mobile-overlay.show .overlay-links a:nth-child(3) {
        transition-delay: 0.3s;
      }
      .mobile-overlay.show .overlay-links a:nth-child(4) {
        transition-delay: 0.4s;
      }

      @media (max-width: 768px) {
        .nav-content {
          min-height: 58px;
        }

        .logo-img {
          height: 42px;
        }

        .mobile-actions .icon-btn,
        .mobile-actions .lang-btn {
          width: 36px;
          height: 36px;
          padding: 0;
        }

        .mobile-overlay {
          align-items: flex-start;
          padding-top: 96px;
        }
      }

      @media (max-width: 991px) {
        nav {
          padding: 0.7rem 0;
        }

        nav.scrolled {
          padding: 0.55rem 0;
        }

        .nav-content {
          min-height: 60px;
        }

        .logo-img {
          height: 44px;
        }

        .mobile-actions {
          gap: 0.35rem !important;
        }

        .menu-toggle {
          width: 38px;
          height: 38px;
          gap: 5px;
        }

        .bar {
          width: 20px;
        }
      }

      @media (min-width: 992px) and (max-width: 1200px) {
        .logo-img {
          height: 52px;
        }

        .links {
          gap: 1.15rem;
        }

        .links a {
          font-size: 0.75rem;
          letter-spacing: 1.3px;
        }
      }

      @media (max-width: 480px) {
        nav,
        nav.scrolled {
          padding: 0.45rem 0;
        }

        .nav-content {
          min-height: 52px;
          gap: 8px;
        }

        .logo-img {
          height: 36px;
        }

        .mobile-actions {
          gap: 0.1rem !important;
        }

        .mobile-actions .icon-btn,
        .mobile-actions .lang-btn,
        .menu-toggle {
          width: 34px;
          height: 34px;
        }

        .btn-icon svg {
          width: 16px;
          height: 16px;
        }

        .lang-code {
          font-size: 0.68rem;
          min-width: 22px;
        }

        .mobile-overlay {
          padding: 78px 18px 22px;
        }

        .overlay-links a {
          min-height: 46px;
          font-size: clamp(0.95rem, 4.3vw, 1.1rem);
          letter-spacing: 1.3px;
        }
      }
    `,
  ],
})
export class NavbarComponent implements OnDestroy {
  isScrolled = false;
  readonly isMenuOpen = signal(false);
  readonly isHomeRoute = signal(true);
  readonly theme = inject(ThemeService);
  readonly lang = inject(LanguageService);
  readonly content = inject(SiteContentService);
  readonly settings = inject(SiteSettingsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly fallbackLogo = 'assets/logo-transparent.png';
  readonly brokenLogoUrl = signal<string | null>(null);
  readonly requestedLogoUrl = computed(() =>
    resolveAssetUrl(this.settings.getValue('brand.logo', '') || this.fallbackLogo),
  );
  readonly logoUrl = computed(() =>
    this.brokenLogoUrl() === this.requestedLogoUrl() ? this.fallbackLogo : this.requestedLogoUrl(),
  );

  constructor() {
    this.updateRouteState();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.updateRouteState();
        this.closeMenu();
      });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu();
  }

  toggleMenu(event?: Event) {
    if (this.blockEditorClick(event)) {
      return;
    }

    if (this.isMenuOpen()) {
      this.closeMenu();
      return;
    }

    this.isMenuOpen.set(true);
    this.setBodyScrollLocked(true);
  }

  onLogoError(event: Event): void {
    const image = event.target as HTMLImageElement | null;

    if (!image) {
      return;
    }

    this.brokenLogoUrl.set(this.requestedLogoUrl());
  }

  toggleTheme(event: Event): void {
    if (this.blockEditorClick(event)) {
      return;
    }

    this.theme.toggleTheme();
  }

  toggleLanguage(event: Event): void {
    if (this.isEditorPreviewMode()) {
      event.preventDefault();
      event.stopPropagation();
      this.closeMenu();
      this.lang.toggleLanguage({ persist: false });
      return;
    }

    if (this.blockEditorClick(event)) {
      return;
    }

    this.lang.toggleLanguage();
  }

  closeMenuLink(event: Event): void {
    if (this.blockEditorClick(event)) {
      return;
    }

    this.closeMenu();
  }

  navigateToSection(sectionId: string, event: Event): void {
    if (this.blockEditorClick(event)) {
      return;
    }

    event.preventDefault();
    this.closeMenu();

    if (this.isHomeRoute()) {
      if (this.currentFragment() !== sectionId) {
        void this.router.navigate([], {
          fragment: sectionId,
          queryParamsHandling: 'preserve',
        });
      }

      window.dispatchEvent(
        new CustomEvent('public-section-nav', {
          detail: { sectionId },
        }),
      );
      return;
    }

    void this.router.navigate(['/'], { fragment: sectionId });
  }

  navigateToRoute(path: string, event: Event): void {
    if (this.blockEditorClick(event)) {
      return;
    }

    event.preventDefault();
    this.closeMenu();

    if (this.currentPath() === path) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    void this.router.navigateByUrl(path);
  }

  blockEditorClick(event?: Event): boolean {
    if (!this.isEditorPreviewMode()) {
      return false;
    }

    event?.preventDefault();
    event?.stopPropagation();
    return true;
  }

  private isEditorPreviewMode(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    const isEditorRoute = new URLSearchParams(window.location.search).get('editor') === 'true';
    return isEditorRoute && document.body.classList.contains('editor-preview');
  }

  ngOnDestroy(): void {
    this.setBodyScrollLocked(false);
  }

  private closeMenu(): void {
    this.isMenuOpen.set(false);
    this.setBodyScrollLocked(false);
  }

  private setBodyScrollLocked(locked: boolean): void {
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  private updateRouteState(): void {
    const path = this.currentPath();
    this.isHomeRoute.set(path === '' || path === '/');
  }

  private currentPath(): string {
    return this.router.url.split(/[?#]/)[0];
  }

  private currentFragment(): string {
    return this.router.url.split('#')[1] ?? '';
  }
}
