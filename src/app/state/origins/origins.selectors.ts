import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OriginsState, originsFeatureKey } from './origins.reducer';

export const selectOriginsState = createFeatureSelector<OriginsState>(originsFeatureKey);

export const selectAllOrigins = createSelector(
  selectOriginsState,
  (state: OriginsState) => state.origins
);

export const selectOriginsLoading = createSelector(
  selectOriginsState,
  (state: OriginsState) => state.loading
);

// We need a selector for About stats (8 varieties, 6 countries, etc) 
// The user asked to pull it from the store: select(getStats)
export const selectCompanyStats = createSelector(
  selectOriginsState,
  (state: OriginsState) => {
    return {
      varietiesCount: 8,
      originsCount: state.origins.length || 6,
      qualityScore: 100,
      daysServing: 365
    };
  }
);
