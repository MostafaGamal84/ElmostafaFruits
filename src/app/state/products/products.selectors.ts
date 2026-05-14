import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState, productsFeatureKey } from './products.reducer';

export const selectProductsState = createFeatureSelector<ProductsState>(productsFeatureKey);

export const selectAllProducts = createSelector(
  selectProductsState,
  (state: ProductsState) => state.products
);

export const selectFilteredProducts = createSelector(
  selectProductsState,
  (state: ProductsState) => state.filteredProducts
);

export const selectLoading = createSelector(
  selectProductsState,
  (state: ProductsState) => state.loading
);

export const selectError = createSelector(
  selectProductsState,
  (state: ProductsState) => state.error
);

export const selectActiveFilter = createSelector(
  selectProductsState,
  (state: ProductsState) => state.activeFilter
);

export const selectSelectedProduct = createSelector(
  selectProductsState,
  (state: ProductsState) => state.selectedProduct
);
