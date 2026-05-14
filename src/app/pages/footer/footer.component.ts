import { Component, inject } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { LanguageService } from '../../core/services/language.service';
import { SiteContentService } from '../../core/services/site-content.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ScrollRevealDirective],
  template: `
    <footer class="footer pt-5 pb-4" id="site-footer" appScrollReveal>
      <div class="footer-nano-line"></div>
      <div class="container pt-4">
        <div class="row mb-5 footer-main">
          <div class="col-md-6 mb-4 mb-md-0 footer-intro text-center text-md-start">
            <h2
              class="brand-glow mb-3"
              data-edit-id="footer.brandText"
              data-edit-label="Footer Brand"
              [attr.data-edit-scope]="lang.currentLang()"
            >
              {{ content.getFooterValue('brandText', lang.currentLang()) }}
            </h2>
            <p class="footer-description text-white-50 mx-auto ms-md-0 me-md-auto">
              <span
                data-edit-id="footer.description"
                data-edit-label="Footer Description"
                data-edit-type="textarea"
                >{{ content.getFooterValue('description', lang.currentLang()) }}</span
              >
            </p>
          </div>
          <div class="col-md-6 footer-contact text-center text-md-end">
            <ul class="contact-list list-unstyled me-5">
              <h3 class="font-playfair theme-text mb-4">
                <span data-edit-id="footer.touch" data-edit-label="Footer Touch Prefix">{{
                  lang.translateEditable('footer.touch')
                }}</span
                ><span
                  class="text-primary"
                  data-edit-id="footer.touchColor"
                  data-edit-label="Footer Touch Highlight"
                  >{{ lang.translateEditable('footer.touchColor') }}</span
                >
              </h3>
              <li class="contact-card">
                <strong
                  class="contact-label text-white-50"
                  data-edit-id="footer.addressLabel"
                  data-edit-label="Footer Address Label"
                  >{{ lang.translateEditable('footer.addressLabel') }}</strong
                >
                <span
                  class="contact-value"
                  data-edit-id="footer.address"
                  data-edit-label="Footer Address"
                  >{{ content.getFooterValue('address', lang.currentLang()) }}</span
                >
              </li>
              <li class="contact-card">
                <strong
                  class="contact-label text-white-50 me-2"
                  data-edit-id="footer.emailLabel"
                  data-edit-label="Footer Email Label"
                  >{{ lang.translateEditable('footer.emailLabel') }}</strong
                >
                <span
                  class="contact-value"
                  data-edit-id="footer.email"
                  data-edit-label="Footer Email"
                  data-edit-scope="global"
                  >{{ content.getFooterValue('email', lang.currentLang()) }}</span
                >
              </li>
              <li class="contact-card">
                <strong
                  class="contact-label text-white-50 me-2"
                  data-edit-id="footer.phoneLabel"
                  data-edit-label="Footer Phone Label"
                  >{{ lang.translateEditable('footer.phoneLabel') }}</strong
                >
                <span
                  class="contact-value"
                  data-edit-id="footer.phone"
                  data-edit-label="Footer Phone"
                  data-edit-scope="global"
                  >{{ content.getFooterValue('phone', lang.currentLang()) }}</span
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="row pt-4 mt-4 bottom-bar align-items-center">
          <div class="col-md-6 mb-3 mb-md-0 text-center text-md-start">
            <small class="text-white-50 footer-meta"
              >&copy; {{ currentYear }}
              <span
                data-edit-id="footer.rightsPrefix"
                data-edit-label="Footer Rights Prefix"
                data-edit-type="textarea"
                >{{ footerRightsCopy() }}</span
              >
              <a
                class="credit-link"
                href="https://nvuem.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nvuem</a
              >.</small
            >
          </div>
          <div class="col-md-6 text-center text-md-end footer-links">
            <a
              href="#"
              class="footer-link"
              data-edit-id="footer.privacy"
              data-edit-label="Footer Privacy Link"
              >{{ lang.translateEditable('footer.privacy') }}</a
            >
            <a
              href="#"
              class="footer-link"
              data-edit-id="footer.terms"
              data-edit-label="Footer Terms Link"
              >{{ lang.translateEditable('footer.terms') }}</a
            >
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        position: relative;
        z-index: 10;
        background-color: var(--bg-surface);
        transition: background-color 0.5s ease;
      }

      .footer-nano-line {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(245, 124, 0, 0.5), transparent);
        box-shadow: 0 0 15px rgba(245, 124, 0, 0.4);
      }

      .brand-glow {
        font-family: var(--font-display);
        font-weight: 900;
        letter-spacing: 3px;
        margin: 0;
        font-size: 2.5rem;
        background: linear-gradient(45deg, var(--text-primary), var(--color-primary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        transition: all 0.5s ease;
        cursor: default;
      }
      .brand-glow:hover {
        background: linear-gradient(45deg, #f57c00, #fff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 20px rgba(245, 124, 0, 0.3);
      }

      .footer-description {
        max-width: 350px;
        line-height: 1.9;
      }

      .footer-contact {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .font-playfair {
        font-family: var(--font-display);
      }

      .text-primary {
        color: var(--color-primary) !important;
      }

      .theme-text {
        color: var(--text-primary);
      }

      .text-white-50 {
        color: var(--text-secondary) !important;
        font-size: 0.95rem;
      }

      .contact-list strong {
        font-size: 0.75rem;
        letter-spacing: 1px;
      }

      .contact-list {
        display: grid;
        gap: 12px;
        margin: 0;
        width: min(100%, 360px);
        margin-inline: 0 auto;
      }

      .contact-card {
        display: grid;
        grid-template-columns: 66px minmax(0, 1fr);
        gap: 10px;
        align-items: center;
        text-align: start;
      }

      .footer-contact h3 {
        width: min(100%, 360px);
        text-align: start;
        margin-inline: 0 auto;
      }

      .contact-value {
        font-family: var(--font-body);
        color: var(--text-primary);
        word-break: break-word;
        line-height: 1.55;
      }

      .footer-links {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 24px;
        flex-wrap: wrap;
      }

      .bottom-bar {
        border-top: 1px solid var(--border-color);
      }

      .footer-meta {
        line-height: 1.8;
      }

      .credit-link {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 700;
        position: relative;
        margin-inline-start: 0.35rem;
        white-space: nowrap;
        transition:
          color 0.3s ease,
          text-shadow 0.3s ease;
      }

      .credit-link::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -2px;
        width: 100%;
        height: 1px;
        background: currentColor;
        opacity: 0.45;
        transform: scaleX(0.35);
        transform-origin: left;
        transition:
          transform 0.3s ease,
          opacity 0.3s ease;
      }

      .credit-link:hover {
        color: var(--text-primary);
        text-shadow: 0 0 18px rgba(245, 124, 0, 0.2);
      }

      .credit-link:hover::after {
        opacity: 1;
        transform: scaleX(1);
      }

      .footer-link {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.85rem;
        position: relative;
        padding-bottom: 2px;
        margin: 0 !important;
        transition: color 0.3s ease;
      }

      .footer-link::after {
        content: '';
        position: absolute;
        width: 0;
        height: 1px;
        bottom: 0;
        left: 0;
        background-color: var(--color-primary);
        transition: width 0.3s ease;
      }

      .footer-link:hover {
        color: #fff;
      }

      .footer-link:hover::after {
        width: 100%;
      }

      [dir='rtl'] .contact-card {
        grid-template-columns: minmax(0, 1fr) 66px;
      }

      [dir='rtl'] .footer-contact h3 {
        margin-inline-start: 0;
        margin-inline-end: auto;
      }

      [dir='rtl'] .footer-links {
        justify-content: flex-start;
      }

      @media (max-width: 767px) {
        .footer {
          padding-top: 2.15rem !important;
          padding-bottom: 1.5rem !important;
        }

        .footer-main {
          margin-bottom: 1.5rem !important;
          row-gap: 1.2rem;
        }

        .footer-intro,
        .footer-contact {
          text-align: start !important;
        }

        .brand-glow {
          font-size: 1.72rem;
          letter-spacing: 1.1px;
        }

        .footer-description {
          max-width: none;
          margin-inline: 0 !important;
          font-size: 0.91rem;
          line-height: 1.72;
        }

        .footer-contact h3 {
          margin-bottom: 0.85rem !important;
          font-size: 1.55rem;
          line-height: 1.1;
          width: auto;
          margin-inline: 0 !important;
        }

        .contact-list {
          gap: 8px;
          justify-content: stretch;
        }

        .contact-card {
          grid-template-columns: 1fr;
          justify-content: stretch;
          gap: 5px;
          padding: 12px 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.02);
          text-align: start;
          align-items: start;
        }

        [dir='rtl'] .contact-card {
          grid-template-columns: 1fr;
        }

        .contact-label {
          margin: 0 !important;
          font-size: 0.7rem;
          letter-spacing: 0.9px;
        }

        .contact-value {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .footer-links {
          justify-content: center;
          gap: 12px 20px;
          text-align: center;
        }

        .footer-meta {
          display: block;
          max-width: 300px;
          text-align: center;
          margin-inline: auto;
          font-size: 0.86rem;
          line-height: 1.7;
        }

        .bottom-bar {
          row-gap: 12px;
          margin-top: 0 !important;
          padding-top: 1rem !important;
          text-align: center;
        }

        .credit-link {
          display: inline-block;
        }

        .footer-link {
          font-size: 0.82rem;
        }
      }

      @media (max-width: 420px) {
        .footer .container {
          padding-top: 0.85rem !important;
          padding-inline: 14px;
        }

        .brand-glow {
          font-size: 1.58rem;
        }

        .footer-description {
          font-size: 0.88rem;
        }

        .footer-contact h3 {
          font-size: 1.45rem;
        }

        .contact-card {
          padding: 11px 13px;
        }

        .contact-value {
          font-size: 0.92rem;
        }

        .footer-meta {
          max-width: 280px;
          font-size: 0.82rem;
        }
      }
    `,
  ],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  lang = inject(LanguageService);
  content = inject(SiteContentService);

  footerRightsCopy(): string {
    return this.lang.translateEditable('footer.rightsPrefix', 'footer.rights');
  }

  footerRightsText(): string {
    return this.lang.currentLang() === 'ar'
      ? 'المصطفى. جميع الحقوق محفوظة. التصميم والتطوير بواسطة'
      : 'Elmostafa. All rights reserved. Designed and developed by';
  }
}
