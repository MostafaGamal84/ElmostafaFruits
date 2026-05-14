import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { API_ROOT_URL, API_V1_BASE_URL } from '../config/api.config';
import { normalizeApiAssetPayload } from '../utils/asset-url.util';

export const assetUrlInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = [API_ROOT_URL, API_V1_BASE_URL].some((url) => request.url.startsWith(url));

  if (!isApiRequest) {
    return next(request);
  }

  return next(request).pipe(
    map((event) =>
      event instanceof HttpResponse
        ? event.clone({ body: normalizeApiAssetPayload(event.body) })
        : event,
    ),
  );
};
