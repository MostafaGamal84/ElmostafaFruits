import { createReducer, on } from '@ngrx/store';
import { Origin } from '../../domain/models/origin.model';
import * as OriginsActions from './origins.actions';

export const originsFeatureKey = 'origins';

export interface OriginsState {
  origins: Origin[];
  loading: boolean;
  error: string | null;
}

export const initialState: OriginsState = {
  origins: [],
  loading: false,
  error: null
};

export const originsReducer = createReducer(
  initialState,
  on(OriginsActions.loadOrigins, state => ({ ...state, loading: true })),
  on(OriginsActions.loadOriginsSuccess, (state, { origins }) => ({ ...state, loading: false, origins })),
  on(OriginsActions.loadOriginsFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
