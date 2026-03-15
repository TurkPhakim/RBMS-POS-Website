/* tslint:disable */
/* eslint-disable */
import { EmployeeAddressResponseModel } from '../models/employee-address-response-model';
export interface EmployeeAddressResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: EmployeeAddressResponseModel;
  status?: string | null;
}
