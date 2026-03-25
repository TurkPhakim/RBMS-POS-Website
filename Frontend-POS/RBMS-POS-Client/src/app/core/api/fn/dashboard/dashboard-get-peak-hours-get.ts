/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { PeakHoursResponseModelBaseResponseModel } from '../../models/peak-hours-response-model-base-response-model';

export interface DashboardGetPeakHoursGet$Params {
  date?: string;
}

export function dashboardGetPeakHoursGet(http: HttpClient, rootUrl: string, params?: DashboardGetPeakHoursGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PeakHoursResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, dashboardGetPeakHoursGet.PATH, 'get');
  if (params) {
    rb.query('date', params.date, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<PeakHoursResponseModelBaseResponseModel>;
    })
  );
}

dashboardGetPeakHoursGet.PATH = '/api/dashboard/peak-hours';
