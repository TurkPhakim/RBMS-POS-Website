/* tslint:disable */
/* eslint-disable */
import { EmployeeEducationResponseModel } from '../models/employee-education-response-model';
export interface EmployeeEducationResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: EmployeeEducationResponseModel;
  status?: string | null;
}
