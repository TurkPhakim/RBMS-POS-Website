/* tslint:disable */
/* eslint-disable */
import { MenuSubCategoryResponseModel } from '../models/menu-sub-category-response-model';
export interface MenuSubCategoryResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: MenuSubCategoryResponseModel;
  status?: string | null;
}
