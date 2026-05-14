import { Component, ElementRef, HostListener, computed, inject, OnInit, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import {
  selectFilteredProducts,
  selectActiveFilter,
} from '../../state/products/products.selectors';
import { selectAllOrigins } from '../../state/origins/origins.selectors';
import { filterByOrigin, selectProduct, loadProducts } from '../../state/products/products.actions';
import { Product } from '../../domain/models/product.model';
import { Origin } from '../../domain/models/origin.model';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, ScrollRevealDirective],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(40px) scale(0.95)' }),
            stagger(100, [
              animate(
                '0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
        query(
          ':leave',
          [
            stagger(50, [
              animate(
                '0.3s ease-out',
                style({ opacity: 0, transform: 'scale(0.9) translateY(20px)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  template: `
    <section class="products-section py-5" id="products" appScrollReveal>
      <div class="container py-5">
        <div class="products-header d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
          <div class="products-copy">
            <span class="eyebrow" data-edit-id="products.eyebrow" data-edit-label="Products Eyebrow">{{ lang.translateEditable('products.eyebrow') }}</span>
            <h2 class="display-3 font-playfair fw-bold mb-2 theme-text" data-edit-id="products.title" data-edit-label="Products Title">
              {{ lang.translateEditable('products.title') }}
            </h2>
            <p class="theme-text mb-0" style="max-width:500px" data-edit-id="products.subtitle" data-edit-label="Products Subtitle" data-edit-type="textarea">
              {{ lang.translateEditable('products.subtitle') }}
            </p>
          </div>

          <div class="filter-wrapper">
            <div class="origin-filter-shell" [class.open]="isFilterMenuOpen()">
              <button
                type="button"
                class="origin-filter-trigger"
                (click)="toggleFilterMenu()"
                [attr.aria-expanded]="isFilterMenuOpen()"
                aria-haspopup="listbox"
                [attr.aria-label]="lang.translate('products.filterEyebrow')"
              >
                <span class="trigger-aura"></span>
                <span class="trigger-content">
                  <span class="trigger-icon">{{ selectedFilterIcon() }}</span>
                  <span class="trigger-copy">
                    <small>{{ filterEyebrowLabel() }}</small>
                    <strong>{{ selectedFilterLabel() }}</strong>
                  </span>
                </span>

                <svg class="trigger-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <div class="origin-filter-menu" *ngIf="isFilterMenuOpen()" role="listbox">
                <button
                  type="button"
                  class="origin-option"
                  [class.active]="!activeFilter()"
                  (click)="onFilterChange(null)"
                  role="option"
                  [attr.aria-selected]="!activeFilter()"
                >
                  <span class="option-icon">🌍</span>
                  <span class="option-copy">
                    <strong>{{ allOriginsLabel() }}</strong>
                    <small>{{ allOriginsHint() }}</small>
                  </span>
                </button>

                <button
                  type="button"
                  class="origin-option"
                  *ngFor="let origin of origins()"
                  [class.active]="activeFilter() === origin.country"
                  (click)="onFilterChange(origin.country)"
                  role="option"
                  [attr.aria-selected]="activeFilter() === origin.country"
                >
                  <span class="option-icon">{{ origin.flag }}</span>
                  <span class="option-copy">
                    <strong>{{ getOriginLabel(origin) }}</strong>
                    <small>{{ origin.country }}</small>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Asymmetric Staggered Grid -->
        <div class="row g-4 staggered-grid" [@listAnimation]="(products$ | async)?.length">
          <div
            class="col-12 col-sm-6 col-lg-4 col-xl-3 product-wrapper"
            *ngFor="let product of products$ | async"
          >
            <div class="offset-container">
              <app-product-card
                [product]="product"
                (cardClicked)="onProductClicked($event)"
              ></app-product-card>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .products-section {
        background-color: var(--bg-primary);
        position: relative;
        overflow: hidden;
        min-height: 100vh;
        scroll-margin-top: 120px;
        padding-top: 2.5rem !important;
        padding-bottom: 3rem !important;
        transition: background-color 0.5s ease;
      }
      .products-section .container {
        padding-top: clamp(3.75rem, 6vw, 5.75rem) !important;
        padding-bottom: clamp(3rem, 5vw, 5rem) !important;
      }
      .eyebrow {
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: 3px;
        font-size: 0.8rem;
        font-weight: 700;
        margin-bottom: 15px;
        display: block;
      }
      .font-playfair {
        font-family: var(--font-display);
      }
      .theme-text {
        color: var(--text-primary);
      }
      .theme-text-muted {
        color: var(--text-secondary);
      }
      .products-copy {
        max-width: 620px;
        display: grid;
        grid-template-columns: max-content minmax(280px, 520px);
        align-items: center;
        column-gap: 2rem;
        row-gap: 0.65rem;
      }

      .products-copy .eyebrow {
        grid-column: 1 / -1;
      }

      .products-copy h2,
      .products-copy p {
        margin-bottom: 0 !important;
      }

      .filter-wrapper {
        position: relative;
        z-index: 30;
        min-width: min(310px, 100%);
      }

      .origin-filter-shell {
        position: relative;
      }

      .origin-filter-trigger {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.95rem 1.1rem 0.95rem 1.2rem;
        border-radius: 999px;
        border: 1px solid rgba(245, 124, 0, 0.35);
        background:
          linear-gradient(180deg, rgba(245, 124, 0, 0.12), rgba(245, 124, 0, 0.02)),
          var(--glass-bg);
        color: var(--text-primary);
        font: inherit;
        text-align: start;
        cursor: pointer;
        overflow: hidden;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        box-shadow:
          0 10px 24px rgba(0, 0, 0, 0.18),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        transition:
          transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
          border-color 0.3s ease,
          box-shadow 0.3s ease,
          background 0.3s ease;
      }

      .origin-filter-trigger:hover,
      .origin-filter-shell.open .origin-filter-trigger {
        transform: translateY(-2px);
        border-color: rgba(245, 124, 0, 0.6);
        box-shadow:
          0 16px 36px rgba(245, 124, 0, 0.18),
          inset 0 1px 0 rgba(255, 255, 255, 0.14);
      }

      .origin-filter-trigger:focus-visible {
        outline: none;
        box-shadow:
          0 0 0 4px rgba(245, 124, 0, 0.18),
          0 16px 36px rgba(245, 124, 0, 0.2);
      }

      .trigger-aura {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 12% 50%, rgba(245, 124, 0, 0.24), transparent 20%),
          linear-gradient(90deg, transparent, rgba(245, 124, 0, 0.08), transparent);
        pointer-events: none;
      }

      .trigger-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 0.85rem;
        min-width: 0;
      }

      .trigger-icon,
      .option-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.08);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
      }

      .trigger-copy,
      .option-copy {
        min-width: 0;
        display: grid;
        gap: 0.1rem;
      }

      .trigger-copy small,
      .option-copy small {
        color: var(--text-secondary);
        font-size: 0.68rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-weight: 700;
      }

      .trigger-copy strong,
      .option-copy strong {
        font-family: var(--font-display);
        font-size: 1rem;
        font-weight: 800;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .trigger-chevron {
        position: relative;
        z-index: 1;
        width: 1.15rem;
        height: 1.15rem;
        flex-shrink: 0;
        color: var(--text-secondary);
        transition:
          transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
          color 0.3s ease;
      }

      .origin-filter-shell.open .trigger-chevron {
        transform: rotate(180deg);
        color: var(--color-primary);
      }

      .origin-filter-menu {
        position: absolute;
        top: calc(100% + 0.85rem);
        inset-inline-start: 0;
        width: 100%;
        padding: 0.7rem;
        border-radius: 26px;
        border: 1px solid rgba(245, 124, 0, 0.22);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
          var(--card-bg);
        backdrop-filter: blur(22px);
        -webkit-backdrop-filter: blur(22px);
        box-shadow:
          0 24px 50px rgba(0, 0, 0, 0.28),
          0 0 0 1px rgba(255, 255, 255, 0.04) inset;
        display: grid;
        gap: 0.35rem;
        animation: dropdownReveal 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .origin-option {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.85rem 0.9rem;
        border: none;
        border-radius: 18px;
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        text-align: start;
        font: inherit;
        transition:
          transform 0.2s ease,
          background 0.2s ease,
          box-shadow 0.2s ease;
      }

      .origin-option:hover {
        transform: translateX(4px);
        background: rgba(245, 124, 0, 0.08);
      }

      .origin-option.active {
        background: linear-gradient(135deg, rgba(245, 124, 0, 0.18), rgba(211, 47, 47, 0.12));
        box-shadow: inset 0 0 0 1px rgba(245, 124, 0, 0.18);
      }

      .origin-option.active .option-icon {
        background: rgba(245, 124, 0, 0.16);
        box-shadow: inset 0 0 0 1px rgba(245, 124, 0, 0.28);
      }

      .origin-option.active .option-copy strong {
        color: var(--color-primary);
      }

      @keyframes dropdownReveal {
        from {
          opacity: 0;
          transform: translateY(-8px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .staggered-grid {
        position: relative;
        z-index: 10;
        align-items: start;
      }

      @media (min-width: 1200px) {
        .offset-container {
          height: 380px;
          transition: margin 0.3s ease;
        }
      }

      @media (min-width: 992px) and (max-width: 1199px) {
        .offset-container {
          height: 370px;
        }
      }

      @media (min-width: 576px) and (max-width: 991px) {
        .offset-container {
          height: auto;
        }

        .product-wrapper:nth-child(even) .offset-container {
          margin-top: 0.75rem;
        }
      }

      /* Mobile: Single column, no stagger */
      @media (max-width: 767px) {
        .products-section {
          min-height: auto;
          scroll-margin-top: 86px;
          padding-top: 0 !important;
          padding-bottom: 1rem !important;
        }

        .products-section .container {
          padding-top: 3.25rem !important;
          padding-bottom: 2.5rem !important;
        }

        .products-header {
          display: grid !important;
          gap: 1.25rem !important;
          margin-bottom: 2rem !important;
        }

        .products-copy {
          max-width: none;
          display: block;
        }

        .products-section .display-3 {
          font-size: clamp(2.15rem, 11vw, 3.25rem);
          line-height: 0.98;
        }

        .products-section p {
          max-width: none !important;
          font-size: 0.96rem;
          line-height: 1.65;
        }

        .eyebrow {
          margin-bottom: 0.65rem;
          font-size: 0.72rem;
          letter-spacing: 2.1px;
        }

        .filter-wrapper {
          min-width: 100%;
        }

        .origin-filter-trigger {
          padding: 0.85rem 0.9rem;
          border-radius: 18px;
        }

        .trigger-content {
          gap: 0.7rem;
        }

        .trigger-icon,
        .option-icon {
          width: 1.75rem;
          height: 1.75rem;
        }

        .trigger-copy small,
        .option-copy small {
          font-size: 0.62rem;
          letter-spacing: 0.12em;
        }

        .trigger-copy strong,
        .option-copy strong {
          font-size: 0.92rem;
        }

        .origin-filter-menu {
          border-radius: 18px;
          padding: 0.45rem;
          max-height: min(320px, 56vh);
          overflow-y: auto;
        }

        .origin-option {
          border-radius: 14px;
          padding: 0.75rem;
        }

        .staggered-grid {
          --bs-gutter-y: 1rem;
          --bs-gutter-x: 0;
        }

        .offset-container {
          height: auto;
          margin-bottom: 0;
        }
      }

      @media (min-width: 768px) and (max-width: 991px) {
        .products-header {
          align-items: flex-start !important;
          margin-bottom: 2.5rem !important;
        }

        .products-section .display-3 {
          font-size: 3.6rem;
        }

        .filter-wrapper {
          min-width: 280px;
        }
      }
    `,
  ],
})
export class ProductsComponent implements OnInit {
  private store = inject(Store);
  private readonly host = inject(ElementRef<HTMLElement>);
  lang = inject(LanguageService);
  readonly isFilterMenuOpen = signal(false);

  products$ = this.store.select(selectFilteredProducts);
  readonly activeFilter = toSignal(this.store.select(selectActiveFilter), { initialValue: null });
  readonly origins = toSignal(this.store.select(selectAllOrigins), { initialValue: [] as Origin[] });
  readonly selectedOrigin = computed(
    () => this.origins().find((origin) => origin.country === this.activeFilter()) ?? null,
  );
  readonly selectedFilterLabel = computed(() =>
    this.selectedOrigin() ? this.getOriginLabel(this.selectedOrigin()) : this.allOriginsLabel(),
  );
  readonly selectedFilterIcon = computed(() => this.selectedOrigin()?.flag ?? '🌍');

  ngOnInit() {
    this.store.dispatch(loadProducts());
  }

  onFilterChange(origin: string | null) {
    this.store.dispatch(filterByOrigin({ origin }));
    this.isFilterMenuOpen.set(false);
  }

  onProductClicked(product: Product) {
    this.store.dispatch(selectProduct({ id: product.id }));
  }

  toggleFilterMenu(): void {
    this.isFilterMenuOpen.update((open) => !open);
  }

  filterEyebrowLabel(): string {
    return this.lang.translateEditable('products.filterEyebrow');
  }

  allOriginsLabel(): string {
    return this.lang.translateEditable('products.allOrigins').replace(/^[^\p{L}\p{N}]+/u, '').trim();
  }

  allOriginsHint(): string {
    return this.lang.translateEditable('products.allOriginsHint');
  }

  getOriginLabel(origin: Origin | null): string {
    if (!origin) {
      return this.allOriginsLabel();
    }

    return this.lang.isRtl() ? origin.country_ar || origin.country : origin.country;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;

    if (target && this.host.nativeElement.contains(target)) {
      return;
    }

    this.isFilterMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isFilterMenuOpen.set(false);
  }
}
