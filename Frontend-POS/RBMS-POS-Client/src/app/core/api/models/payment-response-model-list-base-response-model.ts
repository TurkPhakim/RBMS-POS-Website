/* tslint:disable */
/* eslint-disable */
import { PaymentResponseModel } from '../models/payment-response-model';
export interface PaymentResponseModelListBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: Array<PaymentResponseModel> | null;
  status?: string | null;
}
