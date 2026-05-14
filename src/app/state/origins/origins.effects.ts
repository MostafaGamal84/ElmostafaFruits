import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as OriginsActions from './origins.actions';
import { ORIGIN_REPOSITORY_TOKEN } from '../../core/tokens/repository.tokens';

@Injectable()
export class OriginsEffects {
  private actions$ = inject(Actions);
  private originRepository = inject(ORIGIN_REPOSITORY_TOKEN);

  loadOrigins$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OriginsActions.loadOrigins),
      mergeMap(() => 
        this.originRepository.getOrigins().pipe(
          map(origins => OriginsActions.loadOriginsSuccess({ origins })),
          catchError(error => of(OriginsActions.loadOriginsFailure({ error: error.message })))
        )
      )
    );
  });
}
