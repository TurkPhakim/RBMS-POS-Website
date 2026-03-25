/* tslint:disable */
/* eslint-disable */
import { PeakHoursResponseModel } from '../models/peak-hours-response-model';
export interface PeakHoursResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: PeakHoursResponseModel;
  status?: string | null;
}
