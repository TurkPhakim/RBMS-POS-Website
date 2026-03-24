/* tslint:disable */
/* eslint-disable */
import { ReceiptDataModel } from '../models/receipt-data-model';
export interface ReceiptDataModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: ReceiptDataModel;
  status?: string | null;
}
