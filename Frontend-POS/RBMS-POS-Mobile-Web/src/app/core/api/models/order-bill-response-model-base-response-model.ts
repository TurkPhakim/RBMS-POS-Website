/* tslint:disable */
/* eslint-disable */
import { OrderBillResponseModel } from '../models/order-bill-response-model';
export interface OrderBillResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: OrderBillResponseModel;
  status?: string | null;
}
