/* tslint:disable */
/* eslint-disable */
import { CustomerMenuCategoriesResponseModel } from '../models/customer-menu-categories-response-model';
export interface CustomerMenuCategoriesResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: CustomerMenuCategoriesResponseModel;
  status?: string | null;
}
