/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TopSellingResponseModelBaseResponseModel } from '../../models/top-selling-response-model-base-response-model';

export interface DashboardGetTopSellingGet$Params {
  date?: string;
  days?: number;
}

export function dashboardGetTopSellingGet(http: HttpClient, rootUrl: string, params?: DashboardGetTopSellingGet$Params, context?: HttpContext): Observable<StrictHttpResponse<TopSellingResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, dashboardGetTopSellingGet.PATH, 'get');
  if (params) {
    rb.query('date', params.date, {});
    rb.query('days', params.days, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TopSellingResponseModelBaseResponseModel>;
    })
  );
}

dashboardGetTopSellingGet.PATH = '/api/dashboard/top-selling';
