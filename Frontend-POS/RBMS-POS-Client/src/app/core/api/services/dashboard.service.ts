/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { dashboardGetOverviewGet } from '../fn/dashboard/dashboard-get-overview-get';
import { DashboardGetOverviewGet$Params } from '../fn/dashboard/dashboard-get-overview-get';
import { dashboardGetPeakHoursGet } from '../fn/dashboard/dashboard-get-peak-hours-get';
import { DashboardGetPeakHoursGet$Params } from '../fn/dashboard/dashboard-get-peak-hours-get';
import { dashboardGetSalesReportGet } from '../fn/dashboard/dashboard-get-sales-report-get';
import { DashboardGetSalesReportGet$Params } from '../fn/dashboard/dashboard-get-sales-report-get';
import { dashboardGetTopSellingGet } from '../fn/dashboard/dashboard-get-top-selling-get';
import { DashboardGetTopSellingGet$Params } from '../fn/dashboard/dashboard-get-top-selling-get';
import { DashboardOverviewResponseModelBaseResponseModel } from '../models/dashboard-overview-response-model-base-response-model';
import { PeakHoursResponseModelBaseResponseModel } from '../models/peak-hours-response-model-base-response-model';
import { SalesReportResponseModelBaseResponseModel } from '../models/sales-report-response-model-base-response-model';
import { TopSellingResponseModelBaseResponseModel } from '../models/top-selling-response-model-base-response-model';

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `dashboardGetOverviewGet()` */
  static readonly DashboardGetOverviewGetPath = '/api/dashboard/overview';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `dashboardGetOverviewGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  dashboardGetOverviewGet$Response(params?: DashboardGetOverviewGet$Params, context?: HttpContext): Observable<StrictHttpResponse<DashboardOverviewResponseModelBaseResponseModel>> {
    return dashboardGetOverviewGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `dashboardGetOverviewGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  dashboardGetOverviewGet(params?: DashboardGetOverviewGet$Params, context?: HttpContext): Observable<DashboardOverviewResponseModelBaseResponseModel> {
    return this.dashboardGetOverviewGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<DashboardOverviewResponseModelBaseResponseModel>): DashboardOverviewResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `dashboardGetTopSellingGet()` */
  static readonly DashboardGetTopSellingGetPath = '/api/dashboard/top-selling';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `dashboardGetTopSellingGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  dashboardGetTopSellingGet$Response(params?: DashboardGetTopSellingGet$Params, context?: HttpContext): Observable<StrictHttpResponse<TopSellingResponseModelBaseResponseModel>> {
    return dashboardGetTopSellingGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `dashboardGetTopSellingGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  dashboardGetTopSellingGet(params?: DashboardGetTopSellingGet$Params, context?: HttpContext): Observable<TopSellingResponseModelBaseResponseModel> {
    return this.dashboardGetTopSellingGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<TopSellingResponseModelBaseResponseModel>): TopSellingResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `dashboardGetPeakHoursGet()` */
  static readonly DashboardGetPeakHoursGetPath = '/api/dashboard/peak-hours';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `dashboardGetPeakHoursGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  dashboardGetPeakHoursGet$Response(params?: DashboardGetPeakHoursGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PeakHoursResponseModelBaseResponseModel>> {
    return dashboardGetPeakHoursGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `dashboardGetPeakHoursGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  dashboardGetPeakHoursGet(params?: DashboardGetPeakHoursGet$Params, context?: HttpContext): Observable<PeakHoursResponseModelBaseResponseModel> {
    return this.dashboardGetPeakHoursGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PeakHoursResponseModelBaseResponseModel>): PeakHoursResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `dashboardGetSalesReportGet()` */
  static readonly DashboardGetSalesReportGetPath = '/api/dashboard/sales-report';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `dashboardGetSalesReportGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  dashboardGetSalesReportGet$Response(params?: DashboardGetSalesReportGet$Params, context?: HttpContext): Observable<StrictHttpResponse<SalesReportResponseModelBaseResponseModel>> {
    return dashboardGetSalesReportGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `dashboardGetSalesReportGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  dashboardGetSalesReportGet(params?: DashboardGetSalesReportGet$Params, context?: HttpContext): Observable<SalesReportResponseModelBaseResponseModel> {
    return this.dashboardGetSalesReportGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<SalesReportResponseModelBaseResponseModel>): SalesReportResponseModelBaseResponseModel => r.body)
    );
  }

}
