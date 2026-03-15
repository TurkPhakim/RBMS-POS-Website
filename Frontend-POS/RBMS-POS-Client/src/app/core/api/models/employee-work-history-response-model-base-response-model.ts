/* tslint:disable */
/* eslint-disable */
import { EmployeeWorkHistoryResponseModel } from '../models/employee-work-history-response-model';
export interface EmployeeWorkHistoryResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: EmployeeWorkHistoryResponseModel;
  status?: string | null;
}
