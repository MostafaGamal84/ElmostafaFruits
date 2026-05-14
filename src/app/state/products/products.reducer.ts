import { createReducer, on } from '@ngrx/store';
import { Product } from '../../domain/models/product.model';
import * as ProductsActions from './products.actions';

export const productsFeatureKey = 'products';

export interface ProductsState {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  activeFilter: string | null;
}

export const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
  activeFilter: null
};

export const productsReducer = createReducer(
  initialState,
  on(ProductsActions.loadProducts, state => ({ ...state, loading: true })),
  on(ProductsActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    loading: false,
    products,
    filteredProducts: state.activeFilter ? products.filter(p => p.origin.includes(state.activeFilter!)) : products
  })),
  on(ProductsActions.loadProductsFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(ProductsActions.filterByOrigin, (state, { origin }) => {
    return {
      ...state,
      activeFilter: origin,
      filteredProducts: origin ? state.products.filter(p => p.origin.includes(origin)) : state.products
    };
  }),
  on(ProductsActions.selectProduct, (state, { id }) => ({
    ...state,
    selectedProduct: state.products.find(p => p.id === id) || null
  }))
);
