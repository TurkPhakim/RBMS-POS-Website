/* tslint:disable */
/* eslint-disable */
import { PaymentResponseModel } from '../models/payment-response-model';
export interface PaymentResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: PaymentResponseModel;
  status?: string | null;
}
