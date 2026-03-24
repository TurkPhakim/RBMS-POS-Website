/* tslint:disable */
/* eslint-disable */
import { MenuResponseModel } from '../models/menu-response-model';
export interface MenuResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<MenuResponseModel> | null;
  status?: string | null;
  total?: number;
}
