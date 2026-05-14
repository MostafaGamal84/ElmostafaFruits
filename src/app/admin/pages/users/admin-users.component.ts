import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminUser } from '../../core/models/admin-auth.model';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow">{{ lang.translate('admin.pages.users.eyebrow') }}</span>
          <h2>{{ lang.translate('admin.pages.users.title') }}</h2>
        </div>
      </div>

      <div class="layout">
        <form class="panel" [formGroup]="form" (ngSubmit)="create()">
          <h3>{{ lang.translate('admin.pages.users.createEditor') }}</h3>
          <div class="grid">
            <input
              formControlName="firstName"
              [placeholder]="lang.translate('admin.pages.users.firstName')"
            />
            <input
              formControlName="lastName"
              [placeholder]="lang.translate('admin.pages.users.lastName')"
            />
            <input formControlName="email" [placeholder]="lang.translate('admin.pages.users.email')" />
            <input
              formControlName="password"
              type="password"
              [placeholder]="lang.translate('admin.pages.users.password')"
            />
            <select formControlName="role">
              <option value="Editor">{{ lang.translate('admin.pages.users.roles.editor') }}</option>
              <option value="Admin">{{ lang.translate('admin.pages.users.roles.admin') }}</option>
            </select>
          </div>
          <button type="submit" [disabled]="form.invalid">
            {{ lang.translate('admin.pages.users.createUser') }}
          </button>
        </form>

        <div class="panel list">
          <article class="row" *ngFor="let user of users()">
            <div>
              <strong>{{ user.fullName || user.email }}</strong>
              <small>{{ user.email }} · {{ roleLabel(user.role) }}</small>
            </div>
            <button type="button" class="danger" (click)="remove(user)">
              {{ lang.translate('admin.common.delete') }}
            </button>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .page,
      form,
      .list {
        display: grid;
        gap: 14px;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
        gap: 16px;
      }

      .panel {
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        border-radius: 8px;
        padding: 18px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .row,
      .page-head {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
      }

      .eyebrow {
        color: var(--color-primary);
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      h2,
      h3,
      small {
        margin: 0;
      }

      h2,
      h3,
      strong {
        color: var(--text-primary);
      }

      small {
        color: var(--text-secondary);
      }

      input,
      select {
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-primary);
        border-radius: 6px;
        padding: 11px 12px;
        font: inherit;
      }

      button {
        border: 0;
        border-radius: 6px;
        padding: 10px 13px;
        background: var(--color-primary);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }

      .danger {
        background: #d32f2f;
      }

      @media (max-width: 900px) {
        .layout,
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminUsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AdminAuthService);
  readonly lang = inject(LanguageService);

  readonly users = signal<AdminUser[]>([]);
  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['Editor', [Validators.required, Validators.pattern(/^(Admin|Editor)$/)]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.auth.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (error) => console.error('Failed to load users', error),
    });
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    this.auth.createUser(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ role: 'Editor' });
        this.load();
      },
      error: (error) => console.error('Failed to create user', error),
    });
  }

  remove(user: AdminUser): void {
    if (!user.id || !confirm(this.lang.translate('admin.pages.users.deleteConfirm'))) {
      return;
    }

    this.auth.deleteUser(user.id).subscribe({
      next: () => this.load(),
      error: (error) => console.error('Failed to delete user', error),
    });
  }

  roleLabel(role?: string): string {
    return role === 'Admin'
      ? this.lang.translate('admin.pages.users.roles.admin')
      : this.lang.translate('admin.pages.users.roles.editor');
  }
}
