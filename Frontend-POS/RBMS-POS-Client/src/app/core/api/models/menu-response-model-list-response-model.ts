/* tslint:disable */
/* eslint-disable */
import { MenuResponseModel } from '../models/menu-response-model';
export interface MenuResponseModelListResponseModel {
  message?: string | null;
  results?: Array<MenuResponseModel> | null;
  status?: string | null;
  totalItems?: number;
}
