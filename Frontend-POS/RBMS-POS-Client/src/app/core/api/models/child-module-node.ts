/* tslint:disable */
/* eslint-disable */
import { PermissionItem } from '../models/permission-item';
export interface ChildModuleNode {
  moduleCode?: string | null;
  moduleId?: number;
  moduleName?: string | null;
  permissions?: Array<PermissionItem> | null;
  sortOrder?: number;
}
