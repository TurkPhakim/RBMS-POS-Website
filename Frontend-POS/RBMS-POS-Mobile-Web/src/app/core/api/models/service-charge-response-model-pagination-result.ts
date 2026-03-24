/* tslint:disable */
/* eslint-disable */
import { ServiceChargeResponseModel } from '../models/service-charge-response-model';
export interface ServiceChargeResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<ServiceChargeResponseModel> | null;
  status?: string | null;
  total?: number;
}
