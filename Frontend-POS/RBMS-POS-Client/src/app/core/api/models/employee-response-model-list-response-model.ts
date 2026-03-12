/* tslint:disable */
/* eslint-disable */
import { EmployeeResponseModel } from '../models/employee-response-model';
export interface EmployeeResponseModelListResponseModel {
  message?: string | null;
  results?: Array<EmployeeResponseModel> | null;
  status?: string | null;
  totalItems?: number;
}
