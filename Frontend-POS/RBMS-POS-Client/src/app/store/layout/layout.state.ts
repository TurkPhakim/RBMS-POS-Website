import { Pbutton, BreadcrumbButton } from '@app/shared/component-interfaces';

export interface LayoutState {
  sidebarCollapsed: boolean;
  headerButtons: Pbutton[];
  breadcrumbButtons: BreadcrumbButton[];
}

export const initialLayoutState: LayoutState = {
  sidebarCollapsed: JSON.parse(
    localStorage.getItem('sidebarCollapsed') || 'false',
  ),
  headerButtons: [],
  breadcrumbButtons: [],
};
