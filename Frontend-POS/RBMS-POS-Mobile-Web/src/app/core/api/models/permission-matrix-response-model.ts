/* tslint:disable */
/* eslint-disable */
import { ModuleTreeResponseModel } from '../models/module-tree-response-model';
export interface PermissionMatrixResponseModel {
  grantedAuthorizeMatrixIds?: Array<number> | null;
  moduleTree?: ModuleTreeResponseModel;
  positionId?: number;
  positionName?: string | null;
}
