import { InjectionToken } from '@angular/core';
import { IProductRepository } from '../../domain/repositories/i-product.repository';
import { IOriginRepository } from '../../domain/repositories/i-origin.repository';

export const PRODUCT_REPOSITORY_TOKEN = new InjectionToken<IProductRepository>(
  'PRODUCT_REPOSITORY_TOKEN',
);
export const ORIGIN_REPOSITORY_TOKEN = new InjectionToken<IOriginRepository>(
  'ORIGIN_REPOSITORY_TOKEN',
);
