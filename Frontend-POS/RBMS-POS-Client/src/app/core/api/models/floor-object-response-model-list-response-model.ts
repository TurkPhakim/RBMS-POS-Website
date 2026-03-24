/* tslint:disable */
/* eslint-disable */
import { FloorObjectResponseModel } from '../models/floor-object-response-model';
export interface FloorObjectResponseModelListResponseModel {
  message?: string | null;
  results?: Array<FloorObjectResponseModel> | null;
  status?: string | null;
  totalItems?: number;
}
