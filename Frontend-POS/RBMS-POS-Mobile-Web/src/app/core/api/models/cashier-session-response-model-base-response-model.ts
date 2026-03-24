/* tslint:disable */
/* eslint-disable */
import { CashierSessionResponseModel } from '../models/cashier-session-response-model';
export interface CashierSessionResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: CashierSessionResponseModel;
  status?: string | null;
}
