/* tslint:disable */
/* eslint-disable */
import { MenuSubCategoryResponseModel } from '../models/menu-sub-category-response-model';
export interface MenuSubCategoryResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<MenuSubCategoryResponseModel> | null;
  status?: string | null;
  total?: number;
}
