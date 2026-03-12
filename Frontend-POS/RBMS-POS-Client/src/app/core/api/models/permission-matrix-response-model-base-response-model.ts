/* tslint:disable */
/* eslint-disable */
import { PermissionMatrixResponseModel } from '../models/permission-matrix-response-model';
export interface PermissionMatrixResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: PermissionMatrixResponseModel;
  status?: string | null;
}
