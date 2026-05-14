import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { AdminMockFallbackService } from '../../../core/services/admin-mock-fallback.service';
import {
  AdminSession,
  AdminUser,
  CreateAdminUserRequest,
} from '../models/admin-auth.model';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly STORAGE_KEY = 'elmostafa_admin_session_v2';
  private readonly authUrl = `${API_BASE_URL}/auth`;

  readonly session = signal<AdminSession | null>(this.loadSession());
  readonly isAuthenticated = computed(() => Boolean(this.session()?.accessToken));

  login(email: string, password: string): Observable<AdminSession> {
    return this.http
      .post<unknown>(`${this.authUrl}/login`, {
        email: email.trim(),
        password,
      })
      .pipe(
        map((response) => this.normalizeSessionResponse(response, email)),
        catchError((error) =>
          this.fallbackOrError(error, 'admin password login', () => this.createMockSession(email)),
        ),
        tap((session) => this.persistSession(session)),
      );
  }

  refresh(): Observable<AdminSession> {
    const refreshToken = this.session()?.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token is available.'));
    }

    return this.http.post<unknown>(`${this.authUrl}/refresh`, { refreshToken }).pipe(
      map((response) => this.normalizeSessionResponse(response, this.session()?.user.email ?? '')),
      tap((session) => this.persistSession(session)),
      catchError((error) => this.handleError(error)),
    );
  }

  logout(): void {
    const refreshToken = this.session()?.refreshToken;
    this.clearSession();

    if (!refreshToken) {
      return;
    }

    this.http
      .post(`${this.authUrl}/logout`, { refreshToken })
      .pipe(catchError(() => []))
      .subscribe();
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http
      .get<AdminUser[]>(`${this.authUrl}/users`)
      .pipe(
        map((users) => users.map((user) => this.normalizeAdminUser(user))),
        catchError((error) =>
          this.fallbackOrError(error, 'load admin users', () => this.mock.list<AdminUser>('users')),
        ),
      );
  }

  createUser(payload: CreateAdminUserRequest): Observable<AdminUser> {
    return this.http
      .post<AdminUser>(`${this.authUrl}/users`, payload)
      .pipe(
        map((user) => this.normalizeAdminUser(user)),
        catchError((error) =>
          this.fallbackOrError(error, 'create admin user', () =>
            this.mock.create<AdminUser>('users', {
              ...payload,
              fullName: `${payload.firstName} ${payload.lastName}`.trim(),
            }),
          ),
        ),
      );
  }

  deleteUser(id: string | number): Observable<void> {
    return this.http
      .delete<void>(`${this.authUrl}/users/${id}`)
      .pipe(
        catchError((error) =>
          this.fallbackOrError(error, 'delete admin user', () => {
            this.mock.delete('users', id);
          }),
        ),
      );
  }

  private persistSession(session: AdminSession): void {
    this.session.set(session);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  private clearSession(): void {
    this.session.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadSession(): AdminSession | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const session = JSON.parse(raw) as AdminSession;
      return session.accessToken ? session : null;
    } catch {
      return null;
    }
  }

  private normalizeSessionResponse(response: unknown, fallbackEmail: string): AdminSession {
    const body = response as Record<string, any>;
    const data = body['data'] ?? body;
    const userSource = data['user'] ?? data['admin'] ?? body['user'] ?? body['admin'] ?? {};
    const accessToken =
      data['accessToken'] ?? data['token'] ?? data['jwt'] ?? body['accessToken'] ?? body['token'];
    const refreshToken = data['refreshToken'] ?? body['refreshToken'];
    const roles = [
      ...(Array.isArray(userSource['roles']) ? userSource['roles'] : []),
      ...(Array.isArray(data['roles']) ? data['roles'] : []),
      ...(Array.isArray(body['roles']) ? body['roles'] : []),
    ].filter((role): role is string => typeof role === 'string' && role.trim().length > 0);

    if (!accessToken) {
      throw new Error('Auth response did not include an access token.');
    }

    const firstName = userSource['firstName'] ?? userSource['first_name'] ?? '';
    const lastName = userSource['lastName'] ?? userSource['last_name'] ?? '';
    const fullName =
      userSource['fullName'] ??
      userSource['full_name'] ??
      `${firstName} ${lastName}`.trim() ??
      fallbackEmail;

    return {
      accessToken,
      refreshToken,
      user: {
        id: userSource['id'],
        email: userSource['email'] ?? fallbackEmail,
        firstName,
        lastName,
        fullName: fullName || fallbackEmail,
        role: userSource['role'] ?? roles[0],
        roles,
      },
    };
  }

  private createMockSession(email: string): AdminSession {
    const fallbackEmail = email?.trim() || 'admin@local.dev';
    return {
      accessToken: 'dev-admin-mock-token',
      refreshToken: 'dev-admin-mock-refresh-token',
      user: {
        id: 1,
        email: fallbackEmail,
        firstName: 'Local',
        lastName: 'Admin',
        fullName: 'Local Admin',
        role: 'Admin',
      },
    };
  }

  private normalizeAdminUser(user: AdminUser): AdminUser {
    const firstName = user.firstName ?? '';
    const lastName = user.lastName ?? '';
    const roles = Array.isArray(user.roles) ? user.roles : [];

    return {
      ...user,
      firstName,
      lastName,
      fullName: user.fullName || `${firstName} ${lastName}`.trim() || user.email,
      role: user.role ?? roles[0],
      roles,
    };
  }

  private fallbackOrError<T>(
    error: HttpErrorResponse,
    label: string,
    valueFactory: () => T,
  ): Observable<T> {
    if (this.mock.enabled) {
      return this.mock.fallback(error, label, valueFactory);
    }

    return this.handleError(error);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      typeof error.error === 'string'
        ? error.error
        : error.error?.message ?? error.message ?? 'Authentication request failed.';

    return throwError(() => new Error(message));
  }
}
