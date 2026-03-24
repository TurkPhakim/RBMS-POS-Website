/* tslint:disable */
/* eslint-disable */
import { CustomerBillResponseModel } from '../models/customer-bill-response-model';
export interface CustomerBillResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: CustomerBillResponseModel;
  status?: string | null;
}
