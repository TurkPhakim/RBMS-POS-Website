/* tslint:disable */
/* eslint-disable */
import { OrderDetailResponseModel } from '../models/order-detail-response-model';
export interface OrderDetailResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: OrderDetailResponseModel;
  status?: string | null;
}
