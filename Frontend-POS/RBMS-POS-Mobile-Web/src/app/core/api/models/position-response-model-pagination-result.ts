/* tslint:disable */
/* eslint-disable */
import { PositionResponseModel } from '../models/position-response-model';
export interface PositionResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<PositionResponseModel> | null;
  status?: string | null;
  total?: number;
}
