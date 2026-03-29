/* tslint:disable */
/* eslint-disable */
import { SalesReportResponseModel } from '../models/sales-report-response-model';
export interface SalesReportResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: SalesReportResponseModel;
  status?: string | null;
}
