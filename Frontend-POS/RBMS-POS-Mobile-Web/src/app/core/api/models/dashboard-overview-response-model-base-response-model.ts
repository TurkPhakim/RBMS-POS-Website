/* tslint:disable */
/* eslint-disable */
import { DashboardOverviewResponseModel } from '../models/dashboard-overview-response-model';
export interface DashboardOverviewResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: DashboardOverviewResponseModel;
  status?: string | null;
}
