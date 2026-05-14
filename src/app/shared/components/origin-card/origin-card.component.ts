import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Origin } from '../../../domain/models/origin.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-origin-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="origin-card premium-node">
      <!-- Ambient Watermark Flag (works perfectly if it's text or emoji) -->
      <div class="watermark-flag" [attr.data-edit-id]="'origin.' + origin.country + '.flag'" [attr.data-edit-label]="origin.country + ' Flag'" data-edit-scope="global">{{ origin.flag }}</div>

      <div class="content">
        <div class="header-line">
          <div class="radar-ping">
            <span class="dot"></span>
            <span class="ring"></span>
          </div>
          <h3 class="font-playfair" [attr.data-edit-id]="'origin.' + origin.country + '.title'" [attr.data-edit-label]="origin.country + ' Title'">{{ lang.isRtl() ? origin.country_ar : origin.country }}</h3>
        </div>

        <div class="products-list">
          <span
            class="product-badge"
            *ngFor="let prod of origin.products; let i = index"
            [attr.data-edit-id]="'origin.' + origin.country + '.product.' + i"
            [attr.data-edit-label]="origin.country + ' Product ' + (i + 1)"
            [style.transition-delay]="i * 0.05 + 's'"
          >
            {{ prod }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .font-playfair {
        font-family: var(--font-display);
      }

      .premium-node {
        position: relative;
        background: var(--card-bg);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        cursor: pointer;
        transition:
          transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
          border-color 0.4s ease,
          box-shadow 0.4s ease;
        min-height: 160px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .premium-node:hover {
        transform: translateY(-8px);
        border-color: var(--color-primary);
        box-shadow: 0 15px 40px rgba(245, 124, 0, 0.15);
        background: var(--bg-surface);
      }

      .watermark-flag {
        position: absolute;
        top: -15px;
        right: -10px;
        font-size: 8rem;
        font-weight: 800;
        line-height: 1;
        opacity: 0.05; /* Faint watermark-like flag */
        user-select: none;
        pointer-events: none;
        transition:
          transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
          opacity 0.8s ease;
        z-index: 1;
      }

      .premium-node:hover .watermark-flag {
        transform: scale(1.1) rotate(-5deg);
        opacity: 0.08; /* Slightly more visible on hover */
      }

      .content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .header-line {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 2rem;
      }

      h3 {
        margin: 0;
        font-size: 1.4rem;
        color: var(--text-primary);
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      /* Radar Ping */
      .radar-ping {
        position: relative;
        width: 12px;
        height: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .radar-ping .dot {
        width: 6px;
        height: 6px;
        background-color: var(--color-primary);
        border-radius: 50%;
        position: relative;
        z-index: 2;
      }
      .radar-ping .ring {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 1px solid var(--color-primary);
        border-radius: 50%;
        animation: radarPulse 2s infinite cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 1;
      }
      @keyframes radarPulse {
        0% {
          transform: scale(0.5);
          opacity: 1;
        }
        100% {
          transform: scale(2.5);
          opacity: 0;
        }
      }

      .products-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: auto;
      }

      .product-badge {
        font-size: 0.75rem;
        padding: 5px 10px;
        border-radius: 6px;
        background: var(--bg-surface);
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        transform: translateX(0);
      }

      .premium-node:hover .product-badge {
        background: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
        transform: translateX(4px);
      }

      @media (max-width: 576px) {
        .premium-node {
          padding: 1.25rem;
          min-height: 140px;
        }
        .watermark-flag {
          font-size: 6rem;
          top: -10px;
          right: -5px;
        }
        h3 {
          font-size: 1.25rem;
        }
      }
    `,
  ],
})
export class OriginCardComponent {
  lang = inject(LanguageService);
  @Input({ required: true }) origin!: Origin;
}
