/* tslint:disable */
/* eslint-disable */
import { DashboardKpiModel } from '../models/dashboard-kpi-model';
import { KitchenBreakdownModel } from '../models/kitchen-breakdown-model';
import { PeriodRevenueTrendModel } from '../models/period-revenue-trend-model';
import { RevenueTrendModel } from '../models/revenue-trend-model';
export interface DashboardOverviewResponseModel {
  hasTwoPeriods?: boolean;
  kitchenBreakdown?: Array<KitchenBreakdownModel> | null;
  period1Label?: string | null;
  period2Label?: string | null;
  periodRevenueTrend?: Array<PeriodRevenueTrendModel> | null;
  previous?: DashboardKpiModel;
  revenueTrend?: Array<RevenueTrendModel> | null;
  selected?: DashboardKpiModel;
}
