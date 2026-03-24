/* tslint:disable */
/* eslint-disable */
import { ServiceChargeResponseModel } from '../models/service-charge-response-model';
export interface ServiceChargeResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: ServiceChargeResponseModel;
  status?: string | null;
}
