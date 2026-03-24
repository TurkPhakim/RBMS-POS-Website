/* tslint:disable */
/* eslint-disable */
import { PaymentResponseModel } from '../models/payment-response-model';
export interface PaymentResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<PaymentResponseModel> | null;
  status?: string | null;
  total?: number;
}
