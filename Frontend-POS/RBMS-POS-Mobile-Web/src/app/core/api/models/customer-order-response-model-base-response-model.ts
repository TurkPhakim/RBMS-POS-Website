/* tslint:disable */
/* eslint-disable */
import { CustomerOrderResponseModel } from '../models/customer-order-response-model';
export interface CustomerOrderResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: CustomerOrderResponseModel;
  status?: string | null;
}
