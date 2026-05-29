import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

import { LanguageService } from '../../core/services/language.service';
import { Origin } from '../../domain/models/origin.model';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { selectAllOrigins } from '../../state/origins/origins.selectors';
import { loadOrigins } from '../../state/origins/origins.actions';

type PinPosition = {
  x: number;
  y: number;
};

type GeoCoordinate = {
  lat: number;
  lon: number;
};

type MapViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

@Component({
  selector: 'app-origins',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <section class="origins-section py-5" id="origins" appScrollReveal>
      <div class="container py-5">
        <div class="row mb-5">
          <div class="col-12 header-container">
            <span
              class="eyebrow"
              data-edit-id="origins.eyebrow"
              data-edit-label="Origins Eyebrow"
            >
              {{ lang.translateEditable('origins.eyebrow') }}
            </span>
            <p
              class="theme-text-muted mb-0"
              data-edit-id="origins.subtitle"
              data-edit-label="Origins Subtitle"
              data-edit-type="textarea"
            >
              {{ lang.translateEditable('origins.subtitle') }}
            </p>
          </div>
        </div>

        <div class="map-panel" *ngIf="origins$ | async as origins">
          <div class="map-orb map-orb-one"></div>
          <div class="map-orb map-orb-two"></div>
          <div class="map-title-block">
            <span
              class="map-kicker"
              data-edit-id="origins.eyebrow"
              data-edit-label="Origins Eyebrow"
            >
              {{ lang.translateEditable('origins.eyebrow') }}
            </span>
            <h2
              class="map-title font-playfair"
              data-edit-id="origins.title"
              data-edit-label="Origins Title"
            >
              {{ lang.translateEditable('origins.title') }}
            </h2>
          </div>

          <div class="real-world-map" aria-hidden="true"></div>

          <svg class="map-overlay" viewBox="0 0 100 58" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <g class="map-grid">
              <path d="M0 14.5 H100" />
              <path d="M0 29 H100" />
              <path d="M0 43.5 H100" />
              <path d="M20 0 V58" />
              <path d="M40 0 V58" />
              <path d="M60 0 V58" />
              <path d="M80 0 V58" />
            </g>
          </svg>

          <div class="map-geo-layer">
            <button
              class="map-pin"
              type="button"
              *ngFor="let origin of origins; let i = index"
              [class.pin-label-left]="labelOnLeft(origin.country)"
              [class.pin-label-top]="labelOnTop(origin.country)"
              [class.pin-label-bottom]="labelOnBottom(origin.country)"
              [style.left.%]="pinX(origin)"
              [style.top.%]="pinY(origin)"
              [style.animation-delay]="i * 0.14 + 's'"
              [attr.aria-label]="displayCountry(origin)"
            >
              <span class="pin-ring"></span>
              <span class="pin-glow"></span>
              <span class="pin-head"></span>
              <span class="pin-label">{{ displayCountry(origin) }}</span>

              <span class="pin-card">
                <span
                  class="pin-card-title"
                  [attr.data-edit-id]="'origin.' + origin.country + '.title'"
                  [attr.data-edit-label]="origin.country + ' Title'"
                >
                  {{ displayCountry(origin) }}
                </span>
                <span class="pin-products">
                  <span
                    class="pin-product"
                    *ngFor="let prod of origin.products; let productIndex = index"
                    [attr.data-edit-id]="'origin.' + origin.country + '.product.' + productIndex"
                    [attr.data-edit-label]="origin.country + ' Product ' + (productIndex + 1)"
                  >
                    {{ prod }}
                  </span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .font-playfair {
        font-family: var(--font-display);
      }

      .origins-section {
        background-color: var(--bg-primary);
        position: relative;
        scroll-margin-top: 112px;
        transition: background-color 0.5s ease;
      }

      .eyebrow {
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: 3px;
        font-size: 0.8rem;
        font-weight: 700;
        display: block;
        grid-column: 1 / -1;
      }

      .header-container {
        display: grid;
        grid-template-columns: minmax(320px, 720px);
        align-items: center;
        justify-content: start;
        row-gap: 0.75rem;
      }

      .theme-text {
        color: var(--text-primary);
      }

      .theme-text-muted {
        color: var(--text-secondary);
        font-size: 1.1rem;
        line-height: 1.65;
      }

      .map-panel {
        position: relative;
        min-height: clamp(420px, 49vw, 660px);
        overflow: hidden;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background:
          radial-gradient(circle at 54% 48%, rgba(245, 124, 0, 0.12), transparent 32%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 58%),
          var(--bg-surface);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
      }

      .map-title-block {
        position: absolute;
        top: clamp(20px, 4vw, 42px);
        inset-inline-start: clamp(20px, 4.5vw, 56px);
        z-index: 5;
        max-width: min(420px, 72%);
      }

      .map-kicker {
        display: block;
        margin-bottom: 8px;
        color: var(--color-primary);
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 3px;
        text-transform: uppercase;
      }

      .map-title {
        margin: 0;
        color: var(--text-primary);
        font-size: clamp(2.25rem, 5.5vw, 5rem);
        font-weight: 900;
        line-height: 0.92;
        text-transform: uppercase;
      }

      .map-orb {
        position: absolute;
        width: 260px;
        aspect-ratio: 1;
        border-radius: 50%;
        filter: blur(38px);
        pointer-events: none;
      }

      .map-orb-one {
        left: 18%;
        top: 8%;
        background: rgba(211, 47, 47, 0.12);
      }

      .map-orb-two {
        right: 14%;
        bottom: 7%;
        background: rgba(245, 124, 0, 0.14);
      }

      .real-world-map,
      .map-overlay,
      .map-geo-layer {
        position: absolute;
        inset: 13% 6% 8%;
        width: 88%;
        height: 79%;
        display: block;
      }

      .real-world-map {
        z-index: 2;
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0.08)),
          linear-gradient(135deg, var(--text-secondary), color-mix(in srgb, var(--color-primary) 18%, var(--text-secondary)));
        opacity: 0.72;
        filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.22));
        mask: url('/assets/world-map.svg') center / 100% 100% no-repeat;
        -webkit-mask: url('/assets/world-map.svg') center / 100% 100% no-repeat;
      }

      .map-overlay {
        z-index: 3;
      }

      .map-geo-layer {
        z-index: 4;
      }

      .map-grid path {
        fill: none;
        stroke: color-mix(in srgb, var(--text-secondary) 18%, transparent);
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
      }

      .map-pin {
        position: absolute;
        width: 28px;
        height: 34px;
        padding: 0;
        border: 0;
        border-radius: 999px 999px 999px 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        transform: translate(-50%, -92%);
        z-index: 1;
        animation: pinFloat 4s ease-in-out infinite;
      }

      .pin-ring,
      .pin-glow,
      .pin-head {
        position: absolute;
        inset: 50% auto auto 50%;
        transform: translate(-50%, -50%);
      }

      .pin-ring {
        top: calc(100% - 2px);
        width: 42px;
        height: 18px;
        border: 1px solid rgba(245, 124, 0, 0.48);
        border-radius: 50%;
        animation: pinPulse 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }

      .pin-glow {
        top: calc(100% - 2px);
        width: 30px;
        height: 12px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(245, 124, 0, 0.36), transparent 70%);
        filter: blur(6px);
      }

      .pin-head {
        top: 37%;
        width: 22px;
        height: 22px;
        border: 2px solid rgba(255, 255, 255, 0.26);
        border-radius: 999px 999px 999px 0;
        background:
          radial-gradient(circle at 38% 32%, rgba(255, 210, 87, 0.95) 0 18%, transparent 19%),
          linear-gradient(135deg, var(--color-primary), var(--color-accent));
        box-shadow:
          0 0 0 5px rgba(245, 124, 0, 0.12),
          0 12px 26px rgba(245, 124, 0, 0.34);
        transform: translate(-50%, -50%) rotate(-45deg);
      }

      .pin-head::after {
        content: '';
        position: absolute;
        inset: 5px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--bg-primary) 82%, transparent);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .pin-label {
        position: absolute;
        left: calc(100% + 7px);
        top: 34%;
        transform: translateY(-50%);
        padding: 5px 10px 6px;
        border-radius: 7px;
        border: 1px solid rgba(245, 124, 0, 0.4);
        background: color-mix(in srgb, var(--bg-primary) 88%, transparent);
        color: var(--text-primary);
        font-size: 0.72rem;
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 22px rgba(0, 0, 0, 0.24);
      }

      .pin-label::before {
        content: '';
        position: absolute;
        top: 50%;
        right: 100%;
        width: 8px;
        height: 1px;
        background: rgba(245, 124, 0, 0.44);
      }

      .pin-label-left .pin-label {
        left: auto;
        right: calc(100% + 7px);
      }

      .pin-label-left .pin-label::before {
        right: auto;
        left: 100%;
      }

      .pin-label-top .pin-label {
        top: auto;
        left: 50%;
        bottom: calc(100% + 5px);
        transform: translateX(-50%);
      }

      .pin-label-top .pin-label::before {
        top: 100%;
        right: 50%;
        width: 1px;
        height: 7px;
      }

      .pin-label-bottom .pin-label {
        top: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
      }

      .pin-label-bottom .pin-label::before {
        top: auto;
        bottom: 100%;
        right: 50%;
        width: 1px;
        height: 8px;
      }

      .pin-card {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 18px);
        width: min(260px, 72vw);
        padding: 14px;
        border: 1px solid rgba(245, 124, 0, 0.32);
        border-radius: 8px;
        background: color-mix(in srgb, var(--card-bg) 90%, transparent);
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.32);
        color: var(--text-primary);
        text-align: start;
        opacity: 0;
        pointer-events: none;
        transform: translate(-50%, 8px);
        transition:
          opacity 0.24s ease,
          transform 0.24s ease;
        backdrop-filter: blur(18px);
      }

      .pin-card-title {
        display: block;
        margin-bottom: 10px;
        font-size: 1rem;
        font-weight: 900;
      }

      .pin-products {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .pin-product {
        padding: 5px 8px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-secondary);
        font-size: 0.72rem;
      }

      .map-pin:hover,
      .map-pin:focus-visible {
        z-index: 10;
        outline: none;
      }

      .map-pin:hover .pin-card,
      .map-pin:focus-visible .pin-card {
        opacity: 1;
        transform: translate(-50%, 0);
      }

      .map-pin:hover .pin-head,
      .map-pin:focus-visible .pin-head {
        box-shadow:
          0 0 0 8px rgba(245, 124, 0, 0.18),
          0 15px 34px rgba(245, 124, 0, 0.5);
      }

      @keyframes pinPulse {
        0% {
          transform: translate(-50%, -50%) scale(0.55);
          opacity: 0.9;
        }
        100% {
          transform: translate(-50%, -50%) scale(1.55);
          opacity: 0;
        }
      }

      @keyframes pinFloat {
        0%,
        100% {
          margin-top: 0;
        }
        50% {
          margin-top: -5px;
        }
      }

      @media (max-width: 991px) {
        .map-panel {
          min-height: 520px;
        }
      }

      @media (max-width: 767px) {
        .header-container {
          display: block;
        }

        .eyebrow {
          margin-bottom: 0.75rem;
          font-size: 0.72rem;
          letter-spacing: 2.1px;
        }

        .header-container h2 {
          font-size: clamp(2rem, 9vw, 2.8rem);
          margin-bottom: 0.85rem !important;
        }

        .theme-text-muted {
          font-size: 0.96rem;
        }

        .map-panel {
          min-height: 470px;
        }

        .pin-label {
          display: none;
        }

        .pin-card {
          width: min(230px, 82vw);
        }
      }
    `,
  ],
})
export class OriginsComponent implements OnInit {
  private readonly store = inject(Store);
  lang = inject(LanguageService);
  origins$ = this.store.select(selectAllOrigins);

  private readonly mapViewBox: MapViewBox = {
    x: 30.767,
    y: 241.591,
    width: 784.077,
    height: 458.627,
  };

  /**
   * Calibrated against the actual `public/assets/world-map.svg` coordinate space.
   * This map is a flattened Robinson-style map, so naive linear lat/lon spacing
   * produces visible drift. These coefficients align backend coordinates to this asset.
   */
  private readonly projection = {
    xOffset: 405.50894391,
    xPerLon: 2.43474459,
    yOffset: 531.83268302,
    yPerLat: -2.68078375,
  };

  private readonly originCoordinates: Record<string, GeoCoordinate> = {
    italy: { lat: 41.8719, lon: 12.5674 },
    poland: { lat: 51.9194, lon: 19.1451 },
    greece: { lat: 39.0742, lon: 21.8243 },
    kenya: { lat: -0.0236, lon: 37.9062 },
    'costa rica': { lat: 9.7489, lon: -83.7534 },
    malaysia: { lat: 4.2105, lon: 101.9758 },
    ecuador: { lat: -1.8312, lon: -78.1834 },
  };

  ngOnInit() {
    this.store.dispatch(loadOrigins());
  }

  pinX(origin: Origin): number {
    return this.getPinPosition(origin).x;
  }

  pinY(origin: Origin): number {
    return this.getPinPosition(origin).y;
  }

  displayCountry(origin: Origin): string {
    return this.lang.isRtl() ? origin.country_ar || origin.country : origin.country;
  }

  labelOnLeft(country: string): boolean {
    return ['italy'].includes(this.normalizeCountry(country));
  }

  labelOnTop(country: string): boolean {
    return ['poland'].includes(this.normalizeCountry(country));
  }

  labelOnBottom(country: string): boolean {
    return ['greece'].includes(this.normalizeCountry(country));
  }

  private getPinPosition(origin: Origin): PinPosition {
    const coordinate = this.readCoordinate(origin);

    if (!coordinate) {
      return { x: 50, y: 50 };
    }

    return this.projectCoordinate(coordinate);
  }

  private readCoordinate(origin: Origin): GeoCoordinate | null {
    if (typeof origin.latitude === 'number' && typeof origin.longitude === 'number') {
      return {
        lat: origin.latitude,
        lon: origin.longitude,
      };
    }

    return this.originCoordinates[this.normalizeCountry(origin.country)] ?? null;
  }

  private projectCoordinate({ lat, lon }: GeoCoordinate): PinPosition {
    const svgX = this.projection.xOffset + lon * this.projection.xPerLon;
    const svgY = this.projection.yOffset + lat * this.projection.yPerLat;
    const x = ((svgX - this.mapViewBox.x) / this.mapViewBox.width) * 100;
    const y = ((svgY - this.mapViewBox.y) / this.mapViewBox.height) * 100;

    return {
      x: this.clamp(x, 1.5, 98.5),
      y: this.clamp(y, 3, 97),
    };
  }

  private normalizeCountry(country: string): string {
    return country.trim().toLowerCase();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
