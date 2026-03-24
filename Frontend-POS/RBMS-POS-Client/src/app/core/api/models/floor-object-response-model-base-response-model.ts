/* tslint:disable */
/* eslint-disable */
import { FloorObjectResponseModel } from '../models/floor-object-response-model';
export interface FloorObjectResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: FloorObjectResponseModel;
  status?: string | null;
}
