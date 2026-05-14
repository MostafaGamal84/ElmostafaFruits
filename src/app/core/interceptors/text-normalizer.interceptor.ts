import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { API_ROOT_URL } from '../config/api.config';
import { repairDeepText } from '../utils/text-normalizer.util';

export const textNormalizerInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = request.url.startsWith(API_ROOT_URL);

  if (!isApiRequest) {
    return next(request);
  }

  return next(request).pipe(
    map((event) =>
      event instanceof HttpResponse ? event.clone({ body: repairDeepText(event.body) }) : event,
    ),
  );
};
