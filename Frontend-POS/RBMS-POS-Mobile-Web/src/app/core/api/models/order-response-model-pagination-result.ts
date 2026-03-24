/* tslint:disable */
/* eslint-disable */
import { OrderResponseModel } from '../models/order-response-model';
export interface OrderResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<OrderResponseModel> | null;
  status?: string | null;
  total?: number;
}
