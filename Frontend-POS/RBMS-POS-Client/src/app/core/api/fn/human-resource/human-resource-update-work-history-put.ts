/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmployeeWorkHistoryResponseModelBaseResponseModel } from '../../models/employee-work-history-response-model-base-response-model';
import { UpdateEmployeeWorkHistoryRequestModel } from '../../models/update-employee-work-history-request-model';

export interface HumanResourceUpdateWorkHistoryPut$Params {
  employeeId: number;
  workHistoryId: number;
      body?: UpdateEmployeeWorkHistoryRequestModel
}

export function humanResourceUpdateWorkHistoryPut(http: HttpClient, rootUrl: string, params: HumanResourceUpdateWorkHistoryPut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeWorkHistoryResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceUpdateWorkHistoryPut.PATH, 'put');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
    rb.path('workHistoryId', params.workHistoryId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<EmployeeWorkHistoryResponseModelBaseResponseModel>;
    })
  );
}

humanResourceUpdateWorkHistoryPut.PATH = '/api/humanresource/{employeeId}/work-histories/{workHistoryId}';
