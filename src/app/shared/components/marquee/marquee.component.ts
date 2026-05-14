import { Component } from '@angular/core';

@Component({
  selector: 'app-marquee',
  standalone: true,
  template: `
    <section class="wave-divider" aria-hidden="true">
      <div class="wave-glow"></div>
      <div class="wave-gradient"></div>

      <div class="wave-stack">
        <svg
          class="wave-layer wave-layer-back"
          viewBox="0 0 2400 160"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            d="M0 62 C150 42 300 46 450 60 C600 74 780 90 950 70 C1065 56 1140 58 1200 62 C1350 42 1500 46 1650 60 C1800 74 1980 90 2150 70 C2265 56 2340 58 2400 62 L2400 160 L0 160 Z"
          />
        </svg>

        <svg
          class="wave-layer wave-layer-mid"
          viewBox="0 0 2400 160"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            d="M0 76 C160 56 330 52 500 64 C650 76 780 100 950 82 C1060 70 1140 72 1200 76 C1360 56 1530 52 1700 64 C1850 76 1980 100 2150 82 C2260 70 2340 72 2400 76 L2400 160 L0 160 Z"
          />
        </svg>

        <svg
          class="wave-layer wave-layer-front"
          viewBox="0 0 2400 160"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            d="M0 88 C190 78 355 72 545 82 C725 92 895 114 1080 96 C1135 91 1174 88 1200 88 C1390 78 1555 72 1745 82 C1925 92 2095 114 2280 96 C2335 91 2374 88 2400 88 L2400 160 L0 160 Z"
          />
        </svg>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .wave-divider {
        min-height: clamp(128px, 13vw, 210px);
        position: relative;
        overflow: hidden;
        background: var(--bg-primary);
        isolation: isolate;
      }

      .wave-glow {
        position: absolute;
        inset-inline: 10%;
        top: 12%;
        height: 58%;
        background:
          radial-gradient(circle at 35% 45%, rgba(245, 124, 0, 0.32), transparent 48%),
          radial-gradient(circle at 66% 30%, rgba(211, 47, 47, 0.24), transparent 52%);
        filter: blur(22px);
        opacity: 0.9;
        pointer-events: none;
        z-index: 0;
      }

      .wave-gradient {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, transparent 0%, rgba(15, 15, 15, 0.1) 28%),
          linear-gradient(
            92deg,
            color-mix(in srgb, var(--color-accent) 82%, #120703 18%) 0%,
            var(--color-primary) 54%,
            color-mix(in srgb, var(--color-highlight) 58%, var(--color-primary) 42%) 100%
          );
        z-index: 1;
      }

      .wave-gradient::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.12) 0%,
          rgba(255, 255, 255, 0.02) 48%,
          rgba(0, 0, 0, 0.2) 100%
        );
      }

      .wave-stack {
        position: absolute;
        inset-inline: 0;
        bottom: -1px;
        height: 68%;
        z-index: 2;
        overflow: hidden;
      }

      .wave-layer {
        position: absolute;
        inset-inline-start: 0;
        bottom: 0;
        width: 200%;
        height: 100%;
        display: block;
        transform: translate3d(0, 0, 0);
        will-change: transform;
      }

      .wave-layer path {
        fill: var(--bg-primary);
      }

      .wave-layer-back {
        opacity: 0.28;
        animation: waveMoveReverse 22s linear infinite;
      }

      .wave-layer-mid {
        opacity: 0.56;
        animation: waveMove 16s linear infinite;
      }

      .wave-layer-front {
        animation: waveMove 10s linear infinite;
      }

      @keyframes waveMove {
        0% {
          transform: translate3d(0, 0, 0);
        }
        100% {
          transform: translate3d(-50%, 0, 0);
        }
      }

      @keyframes waveMoveReverse {
        0% {
          transform: translate3d(-50%, 0, 0);
        }
        100% {
          transform: translate3d(0, 0, 0);
        }
      }

      @media (max-width: 720px) {
        .wave-divider {
          min-height: 116px;
        }
      }
    `,
  ],
})
export class MarqueeComponent {}
