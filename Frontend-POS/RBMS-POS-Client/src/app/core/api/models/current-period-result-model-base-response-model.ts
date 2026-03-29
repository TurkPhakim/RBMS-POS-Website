/* tslint:disable */
/* eslint-disable */
import { CurrentPeriodResultModel } from '../models/current-period-result-model';
export interface CurrentPeriodResultModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: CurrentPeriodResultModel;
  status?: string | null;
}
