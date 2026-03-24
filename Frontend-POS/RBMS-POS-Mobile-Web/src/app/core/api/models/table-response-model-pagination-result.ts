/* tslint:disable */
/* eslint-disable */
import { TableResponseModel } from '../models/table-response-model';
export interface TableResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<TableResponseModel> | null;
  status?: string | null;
  total?: number;
}
