/* tslint:disable */
/* eslint-disable */
import { ChildModuleNode } from '../models/child-module-node';
export interface ModuleNode {
  children?: Array<ChildModuleNode> | null;
  moduleCode?: string | null;
  moduleId?: number;
  moduleName?: string | null;
  sortOrder?: number;
}
