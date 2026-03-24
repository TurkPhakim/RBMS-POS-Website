/* tslint:disable */
/* eslint-disable */
import { ZoneResponseModel } from '../models/zone-response-model';
export interface ZoneResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: ZoneResponseModel;
  status?: string | null;
}
