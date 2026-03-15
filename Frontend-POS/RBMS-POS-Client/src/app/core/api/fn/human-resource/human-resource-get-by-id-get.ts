/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmployeeResponseModelBaseResponseModel } from '../../models/employee-response-model-base-response-model';

export interface HumanResourceGetByIdGet$Params {
  employeeId: number;
}

export function humanResourceGetByIdGet(http: HttpClient, rootUrl: string, params: HumanResourceGetByIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceGetByIdGet.PATH, 'get');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<EmployeeResponseModelBaseResponseModel>;
    })
  );
}

humanResourceGetByIdGet.PATH = '/api/humanresource/{employeeId}';
