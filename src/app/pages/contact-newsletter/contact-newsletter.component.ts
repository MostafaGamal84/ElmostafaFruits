import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';
import { MessagesApiService } from '../../core/services/messages-api.service';
import { NewsletterApiService } from '../../core/services/newsletter-api.service';

@Component({
  selector: 'app-contact-newsletter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="contact-band" id="contact">
      <div class="inner">
        <form [formGroup]="contactForm" (ngSubmit)="submitMessage()" class="panel">
          <span
            class="eyebrow"
            data-edit-id="contact.eyebrow"
            data-edit-label="Contact Eyebrow"
            >{{ lang.translateEditable('contact.eyebrow') }}</span
          >
          <h2
            data-edit-id="contact.title"
            data-edit-label="Contact Title"
          >
            {{ lang.translateEditable('contact.title') }}
          </h2>

          <div class="form-field">
            <label data-edit-id="contact.nameLabel" data-edit-label="Contact Name Label">{{
              lang.translateEditable('contact.nameLabel')
            }}</label>
            <input
              formControlName="name"
              [placeholder]="lang.translateEditable('contact.namePlaceholder')"
            />
          </div>

          <div class="form-field">
            <label data-edit-id="contact.emailLabel" data-edit-label="Contact Email Label">{{
              lang.translateEditable('contact.emailLabel')
            }}</label>
            <input
              formControlName="email"
              [placeholder]="lang.translateEditable('contact.emailPlaceholder')"
            />
            <span
              class="error-text"
              *ngIf="
                contactForm.get('email')?.touched && contactForm.get('email')?.errors?.['email']
              "
            >
              {{ lang.translateEditable('contact.emailError') }}
            </span>
          </div>

          <div class="form-field">
            <label data-edit-id="contact.typeLabel" data-edit-label="Contact Type Label">{{
              lang.translateEditable('contact.typeLabel')
            }}</label>
            <div class="type-toggle" role="radiogroup">
              <label class="type-option">
                <input type="radio" formControlName="contactType" value="supplier" />
                <span>{{ lang.translateEditable('contact.typeSupplier') }}</span>
              </label>
              <label class="type-option">
                <input type="radio" formControlName="contactType" value="customer" />
                <span>{{ lang.translateEditable('contact.typeCustomer') }}</span>
              </label>
            </div>
          </div>

          <div class="form-field">
            <label
              data-edit-id="contact.subjectLabel"
              data-edit-label="Contact Subject Label"
              >{{ lang.translateEditable('contact.subjectLabel') }}</label
            >
            <input
              formControlName="subject"
              [placeholder]="lang.translateEditable('contact.subjectPlaceholder')"
            />
          </div>

          <div class="form-field">
            <label
              data-edit-id="contact.messageLabel"
              data-edit-label="Contact Message Label"
              >{{ lang.translateEditable('contact.messageLabel') }}</label
            >
            <textarea
              formControlName="message"
              rows="5"
              [placeholder]="lang.translateEditable('contact.messagePlaceholder')"
            ></textarea>
          </div>

          <button type="submit" [disabled]="contactForm.invalid || contactSaving()">
            <span *ngIf="!contactSaving()">{{ lang.translateEditable('contact.submitIdle') }}</span>
            <span *ngIf="contactSaving()">{{
              lang.translateEditable('contact.submitLoading')
            }}</span>
          </button>

          <p
            class="status success"
            *ngIf="contactStatusKey() === 'success'"
          >
            {{ contactStatusMessage() }}
          </p>
          <p
            class="status error"
            *ngIf="
              contactStatusKey() && contactStatusKey() !== 'success'
            "
          >
            {{ contactStatusMessage() }}
          </p>
        </form>

        <form [formGroup]="newsletterForm" (ngSubmit)="subscribe()" class="panel compact">
          <span
            class="eyebrow"
            data-edit-id="newsletter.eyebrow"
            data-edit-label="Newsletter Eyebrow"
            >{{ lang.translateEditable('newsletter.eyebrow') }}</span
          >
          <h2
            data-edit-id="newsletter.title"
            data-edit-label="Newsletter Title"
          >
            {{ lang.translateEditable('newsletter.title') }}
          </h2>
          <div class="form-field">
            <label
              data-edit-id="newsletter.emailLabel"
              data-edit-label="Newsletter Email Label"
              >{{ lang.translateEditable('newsletter.emailLabel') }}</label
            >
            <input
              formControlName="email"
              [placeholder]="lang.translateEditable('newsletter.emailPlaceholder')"
            />
          </div>
          <button type="submit" [disabled]="newsletterForm.invalid || newsletterSaving()">
            {{
              newsletterSaving()
                ? lang.translateEditable('newsletter.submitLoading')
                : lang.translateEditable('newsletter.submitIdle')
            }}
          </button>
          <p class="status" *ngIf="newsletterStatusKey()">{{ newsletterStatusMessage() }}</p>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      .contact-band {
        padding: clamp(56px, 8vw, 96px) 20px;
        background: var(--bg-primary);
        scroll-margin-top: 112px;
      }

      .inner {
        width: min(1080px, 100%);
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
        gap: 18px;
        align-items: start;
      }

      .panel {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 30px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }

      .compact {
        position: sticky;
        top: 100px;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      h2 {
        line-height: 1.2;
      }

      input,
      textarea {
        width: 100%;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-primary);
        border-radius: 8px;
        padding: 12px 14px;
        font: inherit;
        text-align: start;
        transition: border-color 0.3s ease;
      }

      input:focus,
      textarea:focus {
        outline: none;
        border-color: var(--color-primary);
      }

      .type-toggle {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .type-option {
        position: relative;
        cursor: pointer;
      }

      .type-option input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .type-option span {
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-surface);
        color: var(--text-primary);
        font-weight: 800;
        text-transform: none;
        letter-spacing: 0;
        transition:
          border-color 0.2s ease,
          background 0.2s ease,
          color 0.2s ease;
      }

      .type-option input:checked + span {
        border-color: rgba(245, 124, 0, 0.75);
        background: rgba(245, 124, 0, 0.14);
        color: var(--color-primary);
      }

      .error-text {
        font-size: 0.75rem;
        color: var(--color-accent);
        font-weight: 600;
      }

      button {
        border: 0;
        border-radius: 8px;
        padding: 14px 20px;
        background: var(--color-primary);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        margin-top: 8px;
      }

      button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(245, 124, 0, 0.3);
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .status {
        font-size: 0.9rem;
        font-weight: 700;
        text-align: center;
        padding: 10px;
        border-radius: 6px;
      }

      .status.success {
        background: rgba(46, 125, 50, 0.1);
        color: var(--color-success);
      }

      .status.error {
        background: rgba(211, 47, 47, 0.1);
        color: var(--color-accent);
      }

      h2,
      p {
        margin: 0;
      }

      h2 {
        color: var(--text-primary);
      }

      [dir='rtl'] .panel {
        text-align: right;
      }

      @media (max-width: 820px) {
        .inner,
        .grid {
          grid-template-columns: 1fr;
        }

        .compact {
          position: static;
        }
      }

      @media (max-width: 640px) {
        .contact-band {
          padding-inline: 16px;
        }

        .panel {
          padding: 22px 18px;
        }

        .type-toggle {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ContactNewsletterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly messagesApi = inject(MessagesApiService);
  private readonly newsletterApi = inject(NewsletterApiService);
  readonly lang = inject(LanguageService);

  readonly contactSaving = signal(false);
  readonly newsletterSaving = signal(false);
  readonly contactStatusKey = signal<'success' | 'error' | ''>('');
  readonly newsletterStatusKey = signal<'success' | 'error' | ''>('');
  readonly contactStatusMessage = computed(() => {
    const key = this.contactStatusKey();
    return key ? this.lang.translateEditable(`contact.${key}`) : '';
  });
  readonly newsletterStatusMessage = computed(() => {
    const key = this.newsletterStatusKey();
    return key ? this.lang.translateEditable(`newsletter.${key}`) : '';
  });

  readonly contactForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contactType: ['supplier', Validators.required],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  readonly newsletterForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submitMessage(): void {
    if (this.contactForm.invalid || this.contactSaving()) {
      return;
    }

    this.contactSaving.set(true);
    const value = this.contactForm.getRawValue();
    this.messagesApi.submitMessage({
      name: value.name,
      email: value.email,
      contactType: value.contactType as 'supplier' | 'customer',
      subject: value.subject,
      message: `[${this.contactTypeLabel(value.contactType)}]\n${value.message}`,
    }).subscribe({
      next: () => {
        this.contactStatusKey.set('success');
        this.contactForm.reset();
        this.contactForm.controls.contactType.setValue('supplier');
        this.contactSaving.set(false);
      },
      error: () => {
        this.contactStatusKey.set('error');
        this.contactSaving.set(false);
      },
    });
  }

  subscribe(): void {
    if (this.newsletterForm.invalid || this.newsletterSaving()) {
      return;
    }

    this.newsletterSaving.set(true);
    this.newsletterApi
      .subscribe({
        email: this.newsletterForm.controls.email.value,
        locale: this.lang.currentLang(),
      })
      .subscribe({
        next: () => {
          this.newsletterStatusKey.set('success');
          this.newsletterForm.reset();
          this.newsletterSaving.set(false);
        },
        error: () => {
          this.newsletterStatusKey.set('error');
          this.newsletterSaving.set(false);
        },
      });
  }

  private contactTypeLabel(value: string): string {
    return value === 'customer' ? 'Customer' : 'Supplier';
  }
}
