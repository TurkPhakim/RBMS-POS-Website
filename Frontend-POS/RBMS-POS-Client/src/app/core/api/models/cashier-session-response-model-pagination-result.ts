/* tslint:disable */
/* eslint-disable */
import { CashierSessionResponseModel } from '../models/cashier-session-response-model';
export interface CashierSessionResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<CashierSessionResponseModel> | null;
  status?: string | null;
  total?: number;
}
