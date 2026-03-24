/* tslint:disable */
/* eslint-disable */
import { OptionGroupResponseModel } from '../models/option-group-response-model';
export interface OptionGroupResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<OptionGroupResponseModel> | null;
  status?: string | null;
  total?: number;
}
