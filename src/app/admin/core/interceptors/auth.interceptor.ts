import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL, API_ROOT_URL } from '../../../core/config/api.config';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const STORAGE_KEY = 'elmostafa_admin_session_v2';
  const isApiRequest = request.url.startsWith(API_ROOT_URL);

  // Read session directly from localStorage to break circular dependency with AdminAuthService
  const rawSession = localStorage.getItem(STORAGE_KEY);
  let accessToken: string | undefined;

  if (rawSession) {
    try {
      const session = JSON.parse(rawSession);
      accessToken = session?.accessToken;
    } catch {
      // Ignore parse errors
    }
  }

  const isPublicAuthRequest = [
    `${API_BASE_URL}/auth/login`,
    `${API_BASE_URL}/auth/refresh`,
  ].some((url) => request.url.startsWith(url));

  if (!accessToken || !isApiRequest || isPublicAuthRequest) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
};
