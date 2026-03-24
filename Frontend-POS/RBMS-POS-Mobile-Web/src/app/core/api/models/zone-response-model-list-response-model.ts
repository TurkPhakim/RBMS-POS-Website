/* tslint:disable */
/* eslint-disable */
import { ZoneResponseModel } from '../models/zone-response-model';
export interface ZoneResponseModelListResponseModel {
  message?: string | null;
  results?: Array<ZoneResponseModel> | null;
  status?: string | null;
  totalItems?: number;
}
