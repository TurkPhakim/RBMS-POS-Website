/* tslint:disable */
/* eslint-disable */
import { ServiceChargeOptionModel } from '../models/service-charge-option-model';
export interface ServiceChargeOptionModelListBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: Array<ServiceChargeOptionModel> | null;
  status?: string | null;
}
