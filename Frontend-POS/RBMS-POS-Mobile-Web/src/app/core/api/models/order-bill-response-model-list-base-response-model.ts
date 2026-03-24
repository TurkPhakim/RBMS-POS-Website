/* tslint:disable */
/* eslint-disable */
import { OrderBillResponseModel } from '../models/order-bill-response-model';
export interface OrderBillResponseModelListBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: Array<OrderBillResponseModel> | null;
  status?: string | null;
}
