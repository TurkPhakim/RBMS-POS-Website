/* tslint:disable */
/* eslint-disable */
import { CustomerMenuItemResponseModel } from '../models/customer-menu-item-response-model';
export interface CustomerMenuItemResponseModelListBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: Array<CustomerMenuItemResponseModel> | null;
  status?: string | null;
}
