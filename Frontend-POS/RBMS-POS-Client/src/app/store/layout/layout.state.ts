import { Pbutton, BreadcrumbButton } from '@app/shared/component-interfaces';

export interface LayoutState {
  sidebarCollapsed: boolean;
  notificationPanelOpen: boolean;
  headerButtons: Pbutton[];
  breadcrumbButtons: BreadcrumbButton[];
}

export const initialLayoutState: LayoutState = {
  sidebarCollapsed: JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false'),
  notificationPanelOpen: false,
  headerButtons: [],
  breadcrumbButtons: [],
};
