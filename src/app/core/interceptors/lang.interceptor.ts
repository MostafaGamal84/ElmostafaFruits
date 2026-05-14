import { HttpInterceptorFn } from '@angular/common/http';
import { API_ROOT_URL } from '../config/api.config';

export const langInterceptor: HttpInterceptorFn = (request, next) => {
  const LANG_KEY = 'elmostafa_lang';
  const currentLang = localStorage.getItem(LANG_KEY) || 'en';
  const isApiRequest = request.url.startsWith(API_ROOT_URL);

  if (!isApiRequest) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        'Accept-Language': currentLang,
      },
    }),
  );
};
