/* tslint:disable */
/* eslint-disable */
import { DashboardKpiModel } from '../models/dashboard-kpi-model';
import { KitchenBreakdownModel } from '../models/kitchen-breakdown-model';
import { RevenueTrendModel } from '../models/revenue-trend-model';
export interface DashboardOverviewResponseModel {
  kitchenBreakdown?: Array<KitchenBreakdownModel> | null;
  previous?: DashboardKpiModel;
  revenueTrend?: Array<RevenueTrendModel> | null;
  selected?: DashboardKpiModel;
}
