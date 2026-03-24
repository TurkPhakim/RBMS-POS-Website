import { createAction, props } from '@ngrx/store';
import { BreadcrumbButton, Pbutton } from '@app/shared/component-interfaces';

// --- Header Buttons ---
export const addOrUpdateHeaderButton = createAction(
  '[Layout] Add Or Update Header Button',
  props<{ button: Pbutton }>(),
);
export const removeHeaderButton = createAction(
  '[Layout] Remove Header Button',
  props<{ key: string }>(),
);
export const setHeaderButtonLoading = createAction(
  '[Layout] Set Header Button Loading',
  props<{ key: string; loading: boolean }>(),
);
export const setHeaderButtonDisabled = createAction(
  '[Layout] Set Header Button Disabled',
  props<{ key: string; disabled: boolean }>(),
);
export const clearHeaderButtons = createAction('[Layout] Clear Header Buttons');

// --- Breadcrumb Buttons ---
export const addOrUpdateBreadcrumbButton = createAction(
  '[Layout] Add Or Update Breadcrumb Button',
  props<{ button: BreadcrumbButton }>(),
);
export const removeBreadcrumbButton = createAction(
  '[Layout] Remove Breadcrumb Button',
  props<{ key: string }>(),
);
export const setBreadcrumbButtonLoading = createAction(
  '[Layout] Set Breadcrumb Button Loading',
  props<{ key: string; loading: boolean }>(),
);
export const setBreadcrumbButtonDisabled = createAction(
  '[Layout] Set Breadcrumb Button Disabled',
  props<{ key: string; disabled: boolean }>(),
);
export const clearBreadcrumbButtons = createAction(
  '[Layout] Clear Breadcrumb Buttons',
);

// --- Sidebar ---
export const toggleSidebar = createAction('[Layout] Toggle Sidebar');
export const setSidebarCollapsed = createAction(
  '[Layout] Set Sidebar Collapsed',
  props<{ collapsed: boolean }>(),
);

