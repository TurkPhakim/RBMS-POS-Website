/* tslint:disable */
/* eslint-disable */
import { MenuResponseModel } from '../models/menu-response-model';
export interface MenuResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: MenuResponseModel;
  status?: string | null;
}
