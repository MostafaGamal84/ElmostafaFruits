import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { productsReducer, productsFeatureKey } from './state/products/products.reducer';
import { originsReducer, originsFeatureKey } from './state/origins/origins.reducer';
import { ProductsEffects } from './state/products/products.effects';
import { OriginsEffects } from './state/origins/origins.effects';
import { PRODUCT_REPOSITORY_TOKEN, ORIGIN_REPOSITORY_TOKEN } from './core/tokens/repository.tokens';
import { ProductRepositoryImpl } from './data/repositories/product.repository.impl';
import { OriginRepositoryImpl } from './data/repositories/origin.repository.impl';
import { authInterceptor } from './admin/core/interceptors/auth.interceptor';
import { langInterceptor } from './core/interceptors/lang.interceptor';
import { assetUrlInterceptor } from './core/interceptors/asset-url.interceptor';
import { textNormalizerInterceptor } from './core/interceptors/text-normalizer.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'disabled', scrollPositionRestoration: 'disabled' }),
    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        langInterceptor,
        assetUrlInterceptor,
        textNormalizerInterceptor,
      ]),
    ),
    provideAnimations(),
    provideStore({
      [productsFeatureKey]: productsReducer,
      [originsFeatureKey]: originsReducer,
    }),
    provideEffects([ProductsEffects, OriginsEffects]),
    { provide: PRODUCT_REPOSITORY_TOKEN, useClass: ProductRepositoryImpl },
    { provide: ORIGIN_REPOSITORY_TOKEN, useClass: OriginRepositoryImpl },
  ],
};
