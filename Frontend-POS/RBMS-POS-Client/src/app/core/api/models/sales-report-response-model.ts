/* tslint:disable */
/* eslint-disable */
import { CategoryBreakdownModel } from '../models/category-breakdown-model';
import { DailyBreakdownModel } from '../models/daily-breakdown-model';
import { DashboardKpiModel } from '../models/dashboard-kpi-model';
import { KitchenBreakdownModel } from '../models/kitchen-breakdown-model';
export interface SalesReportResponseModel {
  categoryBreakdown?: Array<CategoryBreakdownModel> | null;
  dailyBreakdown?: Array<DailyBreakdownModel> | null;
  kitchenBreakdown?: Array<KitchenBreakdownModel> | null;
  summary?: DashboardKpiModel;
}
