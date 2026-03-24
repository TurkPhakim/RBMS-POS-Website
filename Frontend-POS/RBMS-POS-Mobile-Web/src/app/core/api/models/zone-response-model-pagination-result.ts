/* tslint:disable */
/* eslint-disable */
import { ZoneResponseModel } from '../models/zone-response-model';
export interface ZoneResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<ZoneResponseModel> | null;
  status?: string | null;
  total?: number;
}
