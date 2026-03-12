/* tslint:disable */
/* eslint-disable */
import { ServiceChargeDropdownModel } from '../models/service-charge-dropdown-model';
export interface ServiceChargeDropdownModelListResponseModel {
  message?: string | null;
  results?: Array<ServiceChargeDropdownModel> | null;
  status?: string | null;
  totalItems?: number;
}
