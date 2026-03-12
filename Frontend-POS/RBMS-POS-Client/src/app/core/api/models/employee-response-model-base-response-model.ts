/* tslint:disable */
/* eslint-disable */
import { EmployeeResponseModel } from '../models/employee-response-model';
export interface EmployeeResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: EmployeeResponseModel;
  status?: string | null;
}
