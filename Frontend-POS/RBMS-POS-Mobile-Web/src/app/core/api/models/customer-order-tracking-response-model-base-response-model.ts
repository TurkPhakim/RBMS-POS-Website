/* tslint:disable */
/* eslint-disable */
import { CustomerOrderTrackingResponseModel } from '../models/customer-order-tracking-response-model';
export interface CustomerOrderTrackingResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: CustomerOrderTrackingResponseModel;
  status?: string | null;
}
