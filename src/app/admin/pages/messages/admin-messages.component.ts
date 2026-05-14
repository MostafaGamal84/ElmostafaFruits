import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesApiService } from '../../../core/services/messages-api.service';
import { AdminMessage } from '../../../core/models/message.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow">{{ lang.translate('admin.pages.messages.eyebrow') }}</span>
          <h2>{{ lang.translate('admin.pages.messages.title') }}</h2>
          <p>{{ lang.translate('admin.pages.messages.description') }}</p>
        </div>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <p>{{ lang.translate('admin.pages.messages.loading') }}</p>
      </div>

      <div *ngIf="!loading() && messages().length === 0" class="empty-state">
        <p>{{ lang.translate('admin.pages.messages.empty') }}</p>
      </div>

      <div class="message-grid row g-3" *ngIf="!loading() && messages().length > 0">
        <div class="message-col col-12 col-xl-6" *ngFor="let message of messages()">
          <article class="message-card h-100" [class.message-card-active]="isThreadOpen(message.id)">
            <div class="message-top">
              <div>
                <h3>{{ message.name }}</h3>
                <span>{{ message.email }}</span>
              </div>
              <span class="status">{{ message.status }}</span>
            </div>

            <p class="subject">{{ message.subject }}</p>
            <p class="summary">{{ message.summary }}</p>

            <div class="message-footer">
              <span>{{ message.createdAt | date:'medium' }}</span>
              <button
                type="button"
                [class.button-active]="isThreadOpen(message.id)"
                [attr.aria-expanded]="isThreadOpen(message.id)"
                (click)="openThread(message)"
              >
                {{ lang.translate('admin.pages.messages.openThread') }}
              </button>
            </div>
          </article>
        </div>
      </div>

      <div class="thread-overlay" *ngIf="selectedMessage() as activeMessage" (click)="closeThread()">
        <section
          class="thread-panel"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'thread-title-' + activeMessage.id"
          (click)="$event.stopPropagation()"
        >
          <div class="thread-head">
            <div>
              <span class="thread-eyebrow">{{ threadCopy().eyebrow }}</span>
              <h3 [id]="'thread-title-' + activeMessage.id">
                {{ activeMessage.subject || threadCopy().untitled }}
              </h3>
            </div>
            <button
              type="button"
              class="thread-close"
              [attr.aria-label]="threadCopy().close"
              (click)="closeThread()"
            >
              &times;
            </button>
          </div>

          <div class="thread-meta">
            <div class="meta-item">
              <span class="meta-label">{{ threadCopy().senderLabel }}</span>
              <strong>{{ activeMessage.name }}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">{{ threadCopy().emailLabel }}</span>
              <a [href]="'mailto:' + activeMessage.email">{{ activeMessage.email }}</a>
            </div>
            <div class="meta-item" *ngIf="activeMessage.contactType">
              <span class="meta-label">{{ threadCopy().typeLabel }}</span>
              <strong>{{ contactTypeLabel(activeMessage.contactType) }}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">{{ threadCopy().statusLabel }}</span>
              <strong>{{ activeMessage.status }}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">{{ threadCopy().receivedLabel }}</span>
              <strong>{{ activeMessage.createdAt | date:'medium' }}</strong>
            </div>
          </div>

          <div class="thread-body">
            <span class="meta-label">{{ threadCopy().messageLabel }}</span>
            <p>{{ threadBody(activeMessage) }}</p>
          </div>

          <div class="thread-actions">
            <a class="reply-link" [href]="replyLink(activeMessage)">
              {{ threadCopy().replyByEmail }}
            </a>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 18px;
        min-width: 0;
        overflow: hidden;
      }

      .eyebrow {
        display: inline-block;
        margin-bottom: 10px;
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.8rem;
        font-weight: 800;
      }

      h2, h3, p { margin: 0; }

      h2 { color: var(--text-primary); }

      .page-head p,
      .message-top span,
      .summary,
      .message-footer span,
      .loading-state,
      .empty-state {
        color: var(--text-secondary);
      }

      .loading-state, .empty-state {
        padding: 40px;
        text-align: center;
        border: 1px dashed var(--border-color);
        border-radius: 26px;
      }

      .message-grid {
        --bs-gutter-x: 16px;
        --bs-gutter-y: 16px;
        margin-inline: 0;
        min-width: 0;
      }

      .message-col {
        min-width: 0;
      }

      .message-card {
        display: grid;
        gap: 14px;
        min-width: 0;
        padding: 22px;
        border-radius: 26px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition: background 0.4s ease, border-color 0.4s ease;
      }

      .message-card:hover {
        border-color: rgba(245, 124, 0, 0.25);
      }

      .message-card-active {
        border-color: rgba(245, 124, 0, 0.35);
        box-shadow: 0 8px 28px rgba(245, 124, 0, 0.12);
      }

      .message-top, .message-footer {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        align-items: flex-start;
        min-width: 0;
      }

      .message-top > div {
        min-width: 0;
      }

      .message-top h3 { color: var(--text-primary); }

      .message-top h3,
      .message-top span,
      .subject,
      .summary,
      .message-footer span {
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .status {
        flex: 0 0 auto;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(245, 124, 0, 0.12);
        color: var(--color-primary);
        font-size: 0.82rem;
        font-weight: 700;
        white-space: nowrap;
      }

      .subject {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .summary {
        line-height: 1.7;
      }

      button {
        border: none;
        border-radius: 16px;
        padding: 10px 14px;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        color: var(--text-secondary);
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        transition: all 0.25s ease;
        white-space: nowrap;
      }

      button:hover {
        color: var(--text-primary);
        border-color: rgba(245, 124, 0, 0.35);
      }

      .button-active {
        color: var(--text-primary);
        border-color: rgba(245, 124, 0, 0.35);
        background: rgba(245, 124, 0, 0.08);
      }

      .thread-overlay {
        position: fixed;
        inset: 0;
        z-index: 1400;
        display: grid;
        place-items: center;
        padding: 24px;
        background: rgba(5, 8, 18, 0.56);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .thread-panel {
        width: min(760px, 100%);
        max-height: min(88vh, 820px);
        overflow: auto;
        display: grid;
        gap: 18px;
        padding: 24px;
        border-radius: 28px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
      }

      .thread-head,
      .thread-actions {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .thread-eyebrow,
      .meta-label {
        display: inline-block;
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .thread-head h3 {
        color: var(--text-primary);
        margin-top: 8px;
        font-size: clamp(1.2rem, 2vw, 1.6rem);
      }

      .thread-close {
        min-width: 44px;
        min-height: 44px;
        padding: 0;
        border-radius: 14px;
        font-size: 1.5rem;
        line-height: 1;
      }

      .thread-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .meta-item,
      .thread-body {
        display: grid;
        gap: 8px;
        padding: 16px;
        border-radius: 20px;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
      }

      .meta-item strong,
      .meta-item a,
      .thread-body p {
        color: var(--text-primary);
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .meta-item a,
      .reply-link {
        text-decoration: none;
      }

      .meta-item a:hover,
      .reply-link:hover {
        text-decoration: underline;
      }

      .thread-body p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.8;
        white-space: pre-wrap;
      }

      .reply-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 46px;
        padding: 0 18px;
        border-radius: 16px;
        border: 1px solid rgba(245, 124, 0, 0.28);
        color: var(--text-primary);
        background: rgba(245, 124, 0, 0.08);
        font-weight: 700;
      }

      @media (max-width: 960px) {
        .message-card {
          border-radius: 22px;
          padding: 18px;
        }

        .thread-panel {
          border-radius: 24px;
          padding: 20px;
        }
      }

      @media (max-width: 640px) {
        .page {
          gap: 14px;
        }

        .page-head p {
          line-height: 1.7;
        }

        .message-grid {
          --bs-gutter-x: 0;
        }

        .message-col {
          padding-inline: 0;
        }

        .message-card {
          gap: 12px;
          padding: 16px;
          border-radius: 20px;
        }

        .message-top,
        .message-footer {
          display: grid;
          grid-template-columns: 1fr;
          justify-items: start;
        }

        .status {
          justify-self: start;
          white-space: normal;
        }

        .message-footer button {
          width: 100%;
          min-height: 44px;
          white-space: normal;
        }

        .thread-overlay {
          padding: 12px;
        }

        .thread-panel {
          padding: 16px;
          border-radius: 20px;
        }

        .thread-meta {
          grid-template-columns: 1fr;
        }

        .thread-head,
        .thread-actions {
          display: grid;
        }

        .reply-link,
        .thread-close {
          width: 100%;
        }
      }

      @media (max-width: 420px) {
        .loading-state,
        .empty-state {
          padding: 28px 16px;
          border-radius: 20px;
        }

        .message-card {
          padding: 14px;
        }

        .subject {
          font-size: 1rem;
        }
      }
    `,
  ],
})
export class AdminMessagesComponent implements OnInit {
  private readonly messagesApi = inject(MessagesApiService);
  readonly lang = inject(LanguageService);

  readonly messages = signal<AdminMessage[]>([]);
  readonly loading = signal(true);
  readonly selectedMessage = signal<AdminMessage | null>(null);
  readonly threadCopy = computed(() => {
    if (this.lang.currentLang() === 'ar') {
      return {
        eyebrow: 'تفاصيل الرسالة',
        senderLabel: 'المرسل',
        emailLabel: 'البريد الإلكتروني',
        typeLabel: 'نوع التواصل',
        statusLabel: 'الحالة',
        receivedLabel: 'تاريخ الاستلام',
        messageLabel: 'محتوى الرسالة',
        replyByEmail: 'الرد عبر البريد',
        replySubject: 'رد من فريق El Mostafa',
        replyIntro: 'ردًا على رسالتك من الموقع:',
        close: 'إغلاق',
        untitled: 'رسالة بدون عنوان',
        emptyBody: 'لا يوجد نص كامل للرسالة حاليًا، لذلك نعرض الملخص المتاح.',
        supplier: 'مورد',
        customer: 'عميل',
      };
    }

    return {
      eyebrow: 'Message details',
      senderLabel: 'Sender',
      emailLabel: 'Email',
      typeLabel: 'Contact type',
      statusLabel: 'Status',
      receivedLabel: 'Received',
      messageLabel: 'Message',
      replyByEmail: 'Reply by email',
      replySubject: 'Reply from El Mostafa',
      replyIntro: 'Replying to your website message:',
      close: 'Close',
      untitled: 'Untitled message',
      emptyBody: 'No full message body was returned, so the available summary is shown instead.',
      supplier: 'Supplier',
      customer: 'Customer',
    };
  });

  ngOnInit(): void {
    this.loadMessages();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.selectedMessage()) {
      this.closeThread();
    }
  }

  loadMessages(): void {
    this.loading.set(true);
    this.messagesApi.getMessages().subscribe({
      next: (data) => {
        this.messages.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openThread(message: AdminMessage): void {
    this.selectedMessage.set(message);
  }

  closeThread(): void {
    this.selectedMessage.set(null);
  }

  isThreadOpen(messageId: string): boolean {
    return this.selectedMessage()?.id === messageId;
  }

  threadBody(message: AdminMessage): string {
    const content = [message.message, message.body, message.summary]
      .map((value) => value?.trim())
      .find((value) => !!value);

    return content ?? this.threadCopy().emptyBody;
  }

  contactTypeLabel(contactType: string | null | undefined): string {
    if (contactType === 'supplier') {
      return this.threadCopy().supplier;
    }

    if (contactType === 'customer') {
      return this.threadCopy().customer;
    }

    return contactType?.trim() || this.threadCopy().emptyBody;
  }

  replyLink(message: AdminMessage): string {
    const params = new URLSearchParams({
      subject: message.subject?.trim()
        ? `Re: ${message.subject.trim()}`
        : this.threadCopy().replySubject,
      body: `${this.threadCopy().replyIntro}\n\n${this.threadBody(message)}`,
    });

    return `mailto:${message.email}?${params.toString()}`;
  }
}
