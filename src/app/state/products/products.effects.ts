import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as ProductsActions from './products.actions';
import { GetProductsUseCase } from '../../domain/use-cases/get-products.usecase';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private getProductsUseCase = inject(GetProductsUseCase);

  loadProducts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      mergeMap(() => 
        this.getProductsUseCase.execute().pipe(
          map(products => ProductsActions.loadProductsSuccess({ products })),
          catchError(error => of(ProductsActions.loadProductsFailure({ error: error.message })))
        )
      )
    );
  });
}
