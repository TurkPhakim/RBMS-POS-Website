import { createReducer, on } from '@ngrx/store';
import * as LayoutActions from './layout.actions';
import { initialLayoutState } from './layout.state';

function updateButtonInArray<T extends { key: string }>(
  buttons: T[],
  key: string,
  updater: (btn: T) => T,
): T[] {
  return buttons.map((btn) => (btn.key === key ? updater(btn) : btn));
}

export const layoutReducer = createReducer(
  initialLayoutState,

  // --- Header Buttons ---
  on(LayoutActions.addOrUpdateHeaderButton, (state, { button }) => {
    const exists = state.headerButtons.find((b) => b.key === button.key);
    const headerButtons = exists
      ? state.headerButtons.map((b) =>
          b.key === button.key ? { ...b, ...button } : b,
        )
      : [...state.headerButtons, button];
    return { ...state, headerButtons };
  }),
  on(LayoutActions.removeHeaderButton, (state, { key }) => ({
    ...state,
    headerButtons: state.headerButtons.filter((b) => b.key !== key),
  })),
  on(LayoutActions.setHeaderButtonLoading, (state, { key, loading }) => ({
    ...state,
    headerButtons: updateButtonInArray(state.headerButtons, key, (btn) => ({
      ...btn,
      loading,
    })),
  })),
  on(LayoutActions.setHeaderButtonDisabled, (state, { key, disabled }) => ({
    ...state,
    headerButtons: updateButtonInArray(state.headerButtons, key, (btn) => ({
      ...btn,
      disabled,
    })),
  })),
  on(LayoutActions.clearHeaderButtons, (state) => ({
    ...state,
    headerButtons: [],
  })),

  // --- Breadcrumb Buttons ---
  on(LayoutActions.addOrUpdateBreadcrumbButton, (state, { button }) => {
    const exists = state.breadcrumbButtons.find((b) => b.key === button.key);
    const breadcrumbButtons = exists
      ? state.breadcrumbButtons.map((b) =>
          b.key === button.key ? { ...b, ...button } : b,
        )
      : [...state.breadcrumbButtons, button];
    return { ...state, breadcrumbButtons };
  }),
  on(LayoutActions.removeBreadcrumbButton, (state, { key }) => ({
    ...state,
    breadcrumbButtons: state.breadcrumbButtons.filter((b) => b.key !== key),
  })),
  on(LayoutActions.setBreadcrumbButtonLoading, (state, { key, loading }) => ({
    ...state,
    breadcrumbButtons: updateButtonInArray(
      state.breadcrumbButtons,
      key,
      (btn) => ({
        ...btn,
        item: { ...btn.item, loading },
      }),
    ),
  })),
  on(LayoutActions.setBreadcrumbButtonDisabled, (state, { key, disabled }) => ({
    ...state,
    breadcrumbButtons: updateButtonInArray(
      state.breadcrumbButtons,
      key,
      (btn) => ({
        ...btn,
        item: { ...btn.item, disabled },
      }),
    ),
  })),
  on(LayoutActions.clearBreadcrumbButtons, (state) => ({
    ...state,
    breadcrumbButtons: [],
  })),

  // --- Sidebar ---
  on(LayoutActions.toggleSidebar, (state) => {
    const collapsed = !state.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    return { ...state, sidebarCollapsed: collapsed };
  }),
  on(LayoutActions.setSidebarCollapsed, (state, { collapsed }) => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    return { ...state, sidebarCollapsed: collapsed };
  }),

);
