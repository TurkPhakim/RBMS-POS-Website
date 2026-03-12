/* tslint:disable */
/* eslint-disable */
import { PositionResponseModel } from '../models/position-response-model';
export interface PositionResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: PositionResponseModel;
  status?: string | null;
}
