/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateEmployeeWorkHistoryRequestModel } from '../../models/create-employee-work-history-request-model';
import { EmployeeWorkHistoryResponseModelBaseResponseModel } from '../../models/employee-work-history-response-model-base-response-model';

export interface HumanResourceCreateWorkHistoryPost$Params {
  employeeId: number;
      body?: CreateEmployeeWorkHistoryRequestModel
}

export function humanResourceCreateWorkHistoryPost(http: HttpClient, rootUrl: string, params: HumanResourceCreateWorkHistoryPost$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeWorkHistoryResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceCreateWorkHistoryPost.PATH, 'post');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
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

humanResourceCreateWorkHistoryPost.PATH = '/api/humanresource/{employeeId}/work-histories';
