import { Component, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  template: `
    <section class="about-us-section" id="about-us">
      <div class="container about-us-layout">
        <div class="photo-story" aria-hidden="true">
          <figure class="photo-frame photo-frame-main">
            <img
              class="about-logo"
              src="assets/logo-transparent.png"
              alt="El Mostafa"
              loading="lazy"
              decoding="async"
              data-edit-id="aboutUs.logo"
              data-edit-label="About Us Logo"
              data-edit-type="image"
              data-edit-scope="global"
            />
          </figure>
          <figure class="photo-frame photo-frame-small photo-frame-top">
            <img src="assets/real-apple.png" alt="" loading="lazy" decoding="async" />
          </figure>
          <figure class="photo-frame photo-frame-small photo-frame-bottom">
            <img src="assets/real-banana-cutout.png" alt="" loading="lazy" decoding="async" />
          </figure>
        </div>

        <div class="about-copy">
          <span
            class="eyebrow"
            data-edit-id="aboutUs.eyebrow"
            data-edit-label="About Us Eyebrow"
          >
            {{ lang.translateEditable('aboutUs.eyebrow', 'aboutUs.eyebrow') }}
          </span>
          <h2
            class="font-playfair"
            data-edit-id="aboutUs.title"
            data-edit-label="About Us Title"
          >
            {{ lang.translateEditable('aboutUs.title', 'aboutUs.title') }}
          </h2>
          <p
            data-edit-id="aboutUs.lead"
            data-edit-label="About Us Lead"
            data-edit-type="textarea"
          >
            {{ lang.translateEditable('aboutUs.lead', 'aboutUs.lead') }}
          </p>
          <p
            data-edit-id="aboutUs.body"
            data-edit-label="About Us Body"
            data-edit-type="textarea"
          >
            {{ lang.translateEditable('aboutUs.body', 'aboutUs.body') }}
          </p>

          <div class="about-points" aria-label="Company highlights">
            <span data-edit-id="aboutUs.point.0" data-edit-label="About Us Point 1">
              {{ lang.translateEditable('aboutUs.point.0', 'aboutUs.points.0') }}
            </span>
            <span data-edit-id="aboutUs.point.1" data-edit-label="About Us Point 2">
              {{ lang.translateEditable('aboutUs.point.1', 'aboutUs.points.1') }}
            </span>
            <span data-edit-id="aboutUs.point.2" data-edit-label="About Us Point 3">
              {{ lang.translateEditable('aboutUs.point.2', 'aboutUs.points.2') }}
            </span>
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

      .about-us-section {
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(circle at 16% 24%, rgba(245, 124, 0, 0.12), transparent 30%),
          radial-gradient(circle at 88% 78%, rgba(211, 47, 47, 0.1), transparent 34%),
          var(--bg-primary);
        padding: clamp(88px, 11vw, 150px) 0;
        scroll-margin-top: 110px;
        transition: background-color 0.5s ease;
      }

      .about-us-layout {
        display: grid;
        grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1fr);
        align-items: center;
        gap: clamp(36px, 6vw, 86px);
      }

      .photo-story {
        position: relative;
        min-height: clamp(360px, 42vw, 560px);
      }

      .photo-frame {
        position: absolute;
        margin: 0;
        overflow: visible;
        border: 0;
        background: transparent;
        box-shadow: none;
      }

      .photo-frame img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
        filter: contrast(1.08) saturate(1.05);
      }

      .photo-frame-main {
        inset: 4% 14% 6% 4%;
        display: grid;
        place-items: center;
        padding: clamp(22px, 4vw, 48px);
      }

      .photo-frame-main .about-logo {
        max-width: min(72%, 340px);
        max-height: min(68%, 260px);
        width: auto;
        height: auto;
        padding: 0;
        background: transparent;
        box-shadow: none;
        filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.34));
      }

      .photo-frame-small {
        width: clamp(112px, 12vw, 172px);
        aspect-ratio: 1;
        display: grid;
        place-items: center;
        padding: 0;
        z-index: 2;
      }

      .photo-frame-top {
        top: 0;
        right: 0;
        transform: rotate(7deg);
      }

      .photo-frame-bottom {
        left: 0;
        bottom: 0;
        transform: rotate(-8deg);
      }

      .about-copy {
        max-width: 640px;
      }

      .eyebrow {
        display: inline-block;
        margin-bottom: 14px;
        color: var(--color-primary);
        font-size: 0.78rem;
        font-weight: 900;
        letter-spacing: 3px;
        text-transform: uppercase;
      }

      h2 {
        margin: 0 0 22px;
        color: var(--text-primary);
        font-size: clamp(2.4rem, 5.4vw, 5rem);
        font-weight: 900;
        line-height: 0.95;
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: clamp(1rem, 1.45vw, 1.15rem);
        line-height: 1.8;
      }

      p + p {
        margin-top: 16px;
      }

      .about-points {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 28px;
      }

      .about-points span {
        border: 1px solid rgba(245, 124, 0, 0.28);
        border-radius: 999px;
        padding: 9px 13px;
        background: rgba(245, 124, 0, 0.08);
        color: var(--text-primary);
        font-size: 0.82rem;
        font-weight: 800;
      }

      @media (max-width: 991px) {
        .about-us-layout {
          grid-template-columns: 1fr;
        }

        .photo-story {
          min-height: 420px;
          order: 2;
        }

        .about-copy {
          order: 1;
          max-width: 720px;
        }
      }

      @media (max-width: 576px) {
        .about-us-section {
          padding: 78px 0;
        }

        .photo-story {
          min-height: 340px;
        }

        .photo-frame-main {
          inset: 6% 7% 8% 7%;
        }

        .photo-frame-small {
          width: 104px;
        }
      }
    `,
  ],
})
export class AboutUsComponent {
  readonly lang = inject(LanguageService);
}
