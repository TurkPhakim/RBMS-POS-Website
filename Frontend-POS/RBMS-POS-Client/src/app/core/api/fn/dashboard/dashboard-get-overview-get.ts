/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DashboardOverviewResponseModelBaseResponseModel } from '../../models/dashboard-overview-response-model-base-response-model';

export interface DashboardGetOverviewGet$Params {
  date?: string;
  days?: number;
}

export function dashboardGetOverviewGet(http: HttpClient, rootUrl: string, params?: DashboardGetOverviewGet$Params, context?: HttpContext): Observable<StrictHttpResponse<DashboardOverviewResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, dashboardGetOverviewGet.PATH, 'get');
  if (params) {
    rb.query('date', params.date, {});
    rb.query('days', params.days, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<DashboardOverviewResponseModelBaseResponseModel>;
    })
  );
}

dashboardGetOverviewGet.PATH = '/api/dashboard/overview';
