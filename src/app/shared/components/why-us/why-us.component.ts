import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-why-us',
  standalone: true,
  template: `
    <section class="why-us py-5 bg-dark" id="why-us" appScrollReveal>
      <div class="container py-5">
        <div class="row mb-5">
          <div class="col-12 header-container">
            <span class="eyebrow" data-edit-id="whyUs.eyebrow" data-edit-label="Why Us Eyebrow">{{ lang.translateEditable('whyUs.eyebrow') }}</span>
            <h2 class="display-4 theme-text font-playfair fw-bold mb-3" data-edit-id="whyUs.title" data-edit-label="Why Us Title">
              {{ lang.translateEditable('whyUs.title') }}
            </h2>
            <p class="theme-text-muted" data-edit-id="whyUs.subtitle" data-edit-label="Why Us Subtitle" data-edit-type="textarea">
              {{ lang.translateEditable('whyUs.subtitle') }}
            </p>
          </div>
        </div>
        <div class="row g-4 justify-content-center">
          <div class="col-12 col-md-4">
            <div class="glass-pillar">
              <div class="bg-number font-playfair">1</div>
              <div class="pillar-content">
                <h3 class="font-playfair" data-edit-id="whyUs.pillar1.title" data-edit-label="Why Us Pillar 1 Title">{{ lang.translateEditable('whyUs.pillar1.title', 'whyUs.pillars.0.title') }}</h3>
                <p data-edit-id="whyUs.pillar1.desc" data-edit-label="Why Us Pillar 1 Description" data-edit-type="textarea">
                  {{ lang.translateEditable('whyUs.pillar1.desc', 'whyUs.pillars.0.desc') }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="glass-pillar" style="transition-delay: 0.1s">
              <div class="bg-number font-playfair">2</div>
              <div class="pillar-content">
                <h3 class="font-playfair" data-edit-id="whyUs.pillar2.title" data-edit-label="Why Us Pillar 2 Title">{{ lang.translateEditable('whyUs.pillar2.title', 'whyUs.pillars.1.title') }}</h3>
                <p data-edit-id="whyUs.pillar2.desc" data-edit-label="Why Us Pillar 2 Description" data-edit-type="textarea">
                  {{ lang.translateEditable('whyUs.pillar2.desc', 'whyUs.pillars.1.desc') }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="glass-pillar" style="transition-delay: 0.2s">
              <div class="bg-number font-playfair">3</div>
              <div class="pillar-content">
                <h3 class="font-playfair" data-edit-id="whyUs.pillar3.title" data-edit-label="Why Us Pillar 3 Title">{{ lang.translateEditable('whyUs.pillar3.title', 'whyUs.pillars.2.title') }}</h3>
                <p data-edit-id="whyUs.pillar3.desc" data-edit-label="Why Us Pillar 3 Description" data-edit-type="textarea">
                  {{ lang.translateEditable('whyUs.pillar3.desc', 'whyUs.pillars.2.desc') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .why-us {
        background-color: var(--bg-primary);
        position: relative;
        scroll-margin-top: 112px;
        transition: background-color 0.5s ease;
      }
      .bg-dark {
        background-color: var(--bg-primary);
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
        grid-template-columns: max-content minmax(320px, 620px);
        align-items: center;
        justify-content: start;
        column-gap: clamp(2rem, 5vw, 4.5rem);
        row-gap: 0.75rem;
      }
      .header-container h2,
      .header-container p {
        margin-bottom: 0 !important;
      }
      .theme-text {
        color: var(--text-primary);
      }
      .theme-text-muted {
        color: var(--text-secondary);
        font-size: 1.1rem;
        line-height: 1.6;
        max-width: 600px;
      }
      .font-playfair {
        font-family: var(--font-display);
      }

      .glass-pillar {
        position: relative;
        padding: 2.5rem 2rem;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        height: 100%;
        color: var(--text-primary);
        overflow: hidden;
        transition:
          transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
          border-color 0.4s ease,
          box-shadow 0.4s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        cursor: default;
      }

      .glass-pillar:hover {
        transform: translateY(-10px);
        border-color: rgba(245, 124, 0, 0.3);
        box-shadow: 0 20px 40px rgba(245, 124, 0, 0.1);
      }

      .bg-number {
        position: absolute;
        top: -20px;
        right: 10px;
        font-size: 10rem;
        font-weight: 900;
        color: rgba(255, 255, 255, 0.02);
        line-height: 1;
        z-index: 0;
        transition:
          transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
          color 0.6s ease;
        user-select: none;
        pointer-events: none;
      }

      .glass-pillar:hover .bg-number {
        color: rgba(245, 124, 0, 0.06);
        transform: translateY(-15px) scale(1.05);
      }

      .pillar-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .glass-pillar h3 {
        margin-top: 1rem;
        margin-bottom: 1.5rem;
        font-size: 1.6rem;
        color: var(--color-primary);
        font-weight: 700;
        letter-spacing: 0.5px;
        transition: color 0.3s ease;
      }

      .glass-pillar:hover h3 {
        color: var(--color-highlight, #ff9800);
      }

      .glass-pillar p {
        color: var(--text-secondary);
        line-height: 1.7;
        font-size: 0.95rem;
        margin-bottom: 0;
      }

      @media (max-width: 768px) {
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

        .bg-number {
          font-size: 6.5rem;
          top: -10px;
        }
        .glass-pillar {
          padding: 2rem 1.5rem;
        }
        .glass-pillar h3 {
          font-size: 1.4rem;
        }
      }
    `,
  ],
})
export class WhyUsComponent {
  lang = inject(LanguageService);
}
