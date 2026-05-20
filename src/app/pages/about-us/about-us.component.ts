import {
  AfterViewInit,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutPageSection, AboutPageText } from '../../core/models/about-page.model';
import { LanguageService } from '../../core/services/language.service';
import { AboutPageService } from '../../core/services/about-page.service';
import { resolveAssetUrl } from '../../core/utils/asset-url.util';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="about-subheader" *ngIf="sections().length > 0">
      <div class="container about-subheader-wrap">
        <div class="about-subheader-shell">
          <div class="header-tabs d-none d-md-flex">
            <button
              type="button"
              *ngFor="let section of sections(); trackBy: trackBySection"
              [class.active]="activeSectionId() === section.id"
            (click)="scrollToSection(section.id)"
          >
            {{ readText(section.navLabel) }}
          </button>
        </div>

        <div
          class="header-tabs header-tabs-mobile d-md-none"
          *ngIf="!useMobileSectionSelect()"
        >
          <button
            type="button"
            *ngFor="let section of sections(); trackBy: trackBySection"
            [class.active]="activeSectionId() === section.id"
            (click)="scrollToSection(section.id)"
          >
            {{ readText(section.navLabel) }}
          </button>
        </div>

        <div class="section-select d-md-none" *ngIf="useMobileSectionSelect()">
          <label>
            <span class="visually-hidden">About us sections</span>
            <select [value]="activeSectionId()" (change)="onSectionSelect($event)">
              <option
                *ngFor="let section of sections(); trackBy: trackBySection"
                [value]="section.id"
              >
                {{ readText(section.navLabel) }}
              </option>
            </select>
          </label>
        </div>
      </div>
      </div>
    </section>

    <section
      class="story-section"
      *ngFor="let section of sections(); let index = index; trackBy: trackBySection"
      [id]="section.id"
    >
      <div
        class="story-backdrop"
        [style.background-image]="buildSectionBackground(section, index)"
      ></div>
      <div class="story-overlay"></div>

      <div class="container story-shell">
        <article class="story-card">
          <div class="sun-mark" aria-hidden="true"></div>
          <span class="story-label">{{ readText(section.navLabel) }}</span>
          <h2>{{ readText(section.title) }}</h2>
          <p>{{ readText(section.body) }}</p>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        --about-subheader-shadow: 0 18px 42px rgba(0, 0, 0, 0.08);
        --about-subheader-border: rgba(245, 124, 0, 0.16);
        --about-subheader-bg:
          linear-gradient(135deg, rgba(245, 124, 0, 0.08), rgba(255, 201, 74, 0.04)),
          color-mix(in srgb, var(--bg-primary) 88%, transparent);
        --about-section-overlay:
          linear-gradient(180deg, rgba(24, 28, 38, 0.16), rgba(10, 14, 22, 0.54)),
          radial-gradient(circle at 50% 18%, rgba(255, 201, 74, 0.28), transparent 18%),
          linear-gradient(135deg, rgba(245, 124, 0, 0.24), rgba(91, 42, 13, 0.26));
        --about-section-image-opacity: 0.98;
        --about-card-bg:
          linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 201, 74, 0.06)),
          rgba(16, 18, 24, 0.18);
        background:
          radial-gradient(circle at top left, rgba(245, 124, 0, 0.16), transparent 28%),
          radial-gradient(circle at top right, rgba(255, 201, 74, 0.11), transparent 26%),
          radial-gradient(circle at bottom right, rgba(211, 47, 47, 0.09), transparent 34%),
          var(--bg-primary);
      }

      :host-context(body.dark-theme) {
        --about-subheader-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
        --about-subheader-border: rgba(245, 124, 0, 0.22);
        --about-subheader-bg:
          linear-gradient(135deg, rgba(245, 124, 0, 0.12), rgba(211, 47, 47, 0.08)),
          rgba(24, 24, 24, 0.72);
        --about-section-overlay:
          linear-gradient(180deg, rgba(8, 10, 16, 0.18), rgba(4, 6, 10, 0.68)),
          radial-gradient(circle at 50% 18%, rgba(245, 124, 0, 0.22), transparent 18%),
          linear-gradient(135deg, rgba(245, 124, 0, 0.18), rgba(7, 8, 12, 0.44));
        --about-section-image-opacity: 0.94;
        --about-card-bg:
          linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(245, 124, 0, 0.04)),
          rgba(12, 14, 20, 0.24);
      }

      .about-subheader {
        position: sticky;
        top: 84px;
        z-index: 30;
        padding: 16px 0 20px;
      }

      .about-subheader-wrap {
        display: flex;
        justify-content: center;
      }

      .about-subheader-shell {
        width: fit-content;
        max-width: 100%;
        padding: 14px;
        border-radius: 999px;
        border: 1px solid var(--about-subheader-border);
        background: var(--about-subheader-bg);
        box-shadow: var(--about-subheader-shadow);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }

      .header-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 0;
        justify-content: center;
      }

      .header-tabs button {
        border: 1px solid var(--border-color);
        border-radius: 999px;
        padding: 12px 18px;
        background: var(--bg-surface);
        color: var(--text-secondary);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition:
          transform 0.25s ease,
          background 0.25s ease,
          color 0.25s ease;
      }

      .header-tabs button:hover,
      .header-tabs button.active {
        transform: translateY(-2px);
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        border-color: transparent;
        color: #fff;
        box-shadow: 0 14px 28px rgba(245, 124, 0, 0.24);
      }

      .header-tabs-mobile {
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        padding-bottom: 4px;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .header-tabs-mobile::-webkit-scrollbar {
        display: none;
      }

      .header-tabs-mobile button {
        flex: 0 0 auto;
        min-height: 48px;
        padding-inline: 18px;
        white-space: nowrap;
      }

      .section-select label {
        display: block;
      }

      .section-select select {
        width: 100%;
        min-height: 62px;
        border: 1px solid var(--border-color);
        border-radius: 18px;
        padding: 0 18px;
        background: var(--card-bg);
        color: var(--text-primary);
        font: inherit;
        font-size: 1.05rem;
        font-weight: 700;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      }

      .section-select select:focus {
        outline: 2px solid rgba(245, 124, 0, 0.22);
        outline-offset: 4px;
      }

      .story-section {
        position: relative;
        isolation: isolate;
        min-height: clamp(520px, 84vh, 860px);
        padding: clamp(56px, 8vw, 96px) 0;
        scroll-margin-top: 176px;
      }

      .story-backdrop,
      .story-overlay {
        position: absolute;
      }

      .story-backdrop {
        inset: 0;
        opacity: var(--about-section-image-opacity);
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
      }

      .story-overlay {
        inset: 0;
        background: var(--about-section-overlay);
      }

      .story-shell {
        position: relative;
        z-index: 1;
        min-height: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .story-card {
        width: min(760px, 100%);
        padding: clamp(28px, 4vw, 40px);
        border-radius: 32px;
        background: var(--about-card-bg);
        border: 1px solid rgba(255, 201, 74, 0.28);
        box-shadow: 0 28px 60px rgba(0, 0, 0, 0.18);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #fff;
        text-align: center;
      }

      .sun-mark {
        width: 118px;
        height: 58px;
        margin: 0 auto 22px;
        border-radius: 58px 58px 0 0;
        background: linear-gradient(180deg, #ffd54f 0%, #ffca28 100%);
      }

      .story-label {
        display: inline-block;
        margin-bottom: 14px;
        color: rgba(255, 255, 255, 0.88);
        font-size: 0.84rem;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .story-card h2,
      .story-card p {
        margin: 0;
      }

      .story-card h2 {
        font-size: clamp(2.1rem, 4.8vw, 3.7rem);
        font-weight: 900;
        line-height: 1;
      }

      .story-card p {
        margin-top: 18px;
        color: rgba(255, 255, 255, 0.92);
        font-size: clamp(1rem, 1.5vw, 1.18rem);
        line-height: 1.8;
      }

      @media (max-width: 991px) {
        .about-subheader {
          top: 70px;
          padding: 14px 0 18px;
        }

        .story-card {
          width: min(100%, 640px);
        }
      }

      @media (max-width: 576px) {
        .about-subheader {
          top: 60px;
          padding: 10px 0 14px;
        }

        .about-subheader-wrap {
          display: block;
        }

        .about-subheader-shell {
          padding: 10px;
          border-radius: 26px;
        }

        .header-tabs-mobile {
          gap: 10px;
          margin-inline: -4px;
          padding-inline: 4px;
        }

        .header-tabs-mobile button {
          min-height: 46px;
          padding-inline: 16px;
          font-size: 0.94rem;
        }

        .section-select select {
          min-height: 58px;
          font-size: 1rem;
        }

        .story-section {
          min-height: 460px;
          padding: 34px 0;
          scroll-margin-top: 148px;
        }

        .story-card {
          border-radius: 22px;
          padding: 22px 20px;
        }

        .sun-mark {
          width: 90px;
          height: 44px;
          margin-bottom: 18px;
        }

        .story-label {
          font-size: 0.74rem;
          letter-spacing: 0.14em;
        }
      }
    `,
  ],
})
export class AboutUsComponent implements AfterViewInit {
  readonly lang = inject(LanguageService);
  private readonly aboutPage = inject(AboutPageService);
  private readonly mobileSelectThreshold = 4;

  readonly content = this.aboutPage.content;
  readonly sections = computed(() => this.content().sections);
  readonly activeSectionId = signal('');
  readonly useMobileSectionSelect = computed(
    () => this.sections().length > this.mobileSelectThreshold,
  );

  constructor() {
    effect(() => {
      const sections = this.sections();
      const activeSectionId = this.activeSectionId();

      if (!sections.length) {
        return;
      }

      if (!activeSectionId || !sections.some((section) => section.id === activeSectionId)) {
        queueMicrotask(() => this.activeSectionId.set(sections[0].id));
      }
    });
  }

  ngAfterViewInit(): void {
    window.setTimeout(() => this.syncActiveSectionFromViewport(), 80);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.syncActiveSectionFromViewport();
  }

  trackBySection(_: number, section: AboutPageSection): string {
    return section.id;
  }

  readText(text: AboutPageText): string {
    const locale = this.lang.currentLang();
    return text[locale] || text.en || text.ar;
  }

  resolveSectionImage(section: AboutPageSection): string {
    return resolveAssetUrl(section.imageUrl);
  }

  onSectionSelect(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    const sectionId = target?.value ?? '';

    if (sectionId) {
      this.scrollToSection(sectionId);
    }
  }

  scrollToSection(sectionId: string): void {
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    this.activeSectionId.set(sectionId);
    window.scrollTo({
      top: this.getSectionScrollTop(target),
      left: 0,
      behavior: 'smooth',
    });
  }

  buildSectionBackground(section: AboutPageSection, index: number): string {
    const imageUrl = this.resolveSectionImage(section);
    const primaryGlowX = index % 2 === 0 ? '16%' : '84%';
    const accentGlowX = index % 2 === 0 ? '84%' : '16%';

    if (!imageUrl) {
      return `
        radial-gradient(circle at ${primaryGlowX} 18%, rgba(245, 124, 0, 0.28), transparent 26%),
        radial-gradient(circle at ${accentGlowX} 76%, rgba(255, 201, 74, 0.2), transparent 28%),
        radial-gradient(circle at 50% 100%, rgba(211, 47, 47, 0.12), transparent 32%),
        linear-gradient(135deg, rgba(245, 124, 0, 0.12), rgba(255, 201, 74, 0.08)),
        linear-gradient(180deg, var(--bg-surface), var(--bg-primary))
      `;
    }

    return `url("${imageUrl.replace(/"/g, '%22')}")`;
  }

  private syncActiveSectionFromViewport(): void {
    const sections = this.sections();

    if (!sections.length) {
      return;
    }

    const viewportAnchor = window.innerHeight * 0.36;
    let activeSection = sections[0];
    let smallestDistance = Number.POSITIVE_INFINITY;

    for (const section of sections) {
      const element = document.getElementById(section.id);

      if (!element) {
        continue;
      }

      const rect = element.getBoundingClientRect();

      if (rect.top <= viewportAnchor && rect.bottom >= viewportAnchor) {
        activeSection = section;
        break;
      }

      const distance = Math.abs(rect.top - viewportAnchor);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        activeSection = section;
      }
    }

    if (activeSection.id !== this.activeSectionId()) {
      this.activeSectionId.set(activeSection.id);
    }
  }

  private getSectionScrollTop(target: HTMLElement): number {
    const navbar = document.querySelector<HTMLElement>('app-navbar nav');
    const subheader = document.querySelector<HTMLElement>('app-about-us .about-subheader');
    const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
    const subheaderHeight = subheader?.getBoundingClientRect().height ?? 0;
    const absoluteTop = window.scrollY + target.getBoundingClientRect().top;

    return Math.max(0, Math.round(absoluteTop - navbarHeight - subheaderHeight - 24));
  }
}
