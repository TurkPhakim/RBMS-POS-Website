import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LayoutState } from './layout.state';

export const selectLayoutState = createFeatureSelector<LayoutState>('layout');

export const selectHeaderButtons = createSelector(
  selectLayoutState,
  (state) => state.headerButtons,
);

export const selectBreadcrumbButtons = createSelector(
  selectLayoutState,
  (state) => state.breadcrumbButtons,
);

export const selectSidebarCollapsed = createSelector(
  selectLayoutState,
  (state) => state.sidebarCollapsed,
);

