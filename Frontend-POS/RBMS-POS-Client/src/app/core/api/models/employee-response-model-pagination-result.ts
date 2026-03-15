/* tslint:disable */
/* eslint-disable */
import { EmployeeResponseModel } from '../models/employee-response-model';
export interface EmployeeResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<EmployeeResponseModel> | null;
  status?: string | null;
  total?: number;
}
