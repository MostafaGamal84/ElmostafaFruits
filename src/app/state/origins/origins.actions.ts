import { createAction, props } from '@ngrx/store';
import { Origin } from '../../domain/models/origin.model';

export const loadOrigins = createAction('[Origins Page] Load Origins');

export const loadOriginsSuccess = createAction(
  '[Origins API] Load Origins Success',
  props<{ origins: Origin[] }>()
);

export const loadOriginsFailure = createAction(
  '[Origins API] Load Origins Failure',
  props<{ error: string }>()
);
