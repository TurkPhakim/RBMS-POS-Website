/* tslint:disable */
/* eslint-disable */
import { ServiceChargeResponseModel } from '../models/service-charge-response-model';
export interface ServiceChargeResponseModelListResponseModel {
  message?: string | null;
  results?: Array<ServiceChargeResponseModel> | null;
  status?: string | null;
  totalItems?: number;
}
