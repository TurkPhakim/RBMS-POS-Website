/* tslint:disable */
/* eslint-disable */
import { ModuleTreeResponseModel } from '../models/module-tree-response-model';
export interface ModuleTreeResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: ModuleTreeResponseModel;
  status?: string | null;
}
