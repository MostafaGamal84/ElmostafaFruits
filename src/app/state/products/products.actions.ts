import { createAction, props } from '@ngrx/store';
import { Product } from '../../domain/models/product.model';

export const loadProducts = createAction('[Products Page] Load Products');

export const loadProductsSuccess = createAction(
  '[Products API] Load Products Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Products API] Load Products Failure',
  props<{ error: string }>()
);

export const filterByOrigin = createAction(
  '[Products Page] Filter By Origin',
  props<{ origin: string | null }>()
);

export const selectProduct = createAction(
  '[Products Page] Select Product',
  props<{ id: string }>()
);
