/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmployeeResponseModelBaseResponseModel } from '../../models/employee-response-model-base-response-model';

export interface ApiHumanresourceEmployeeIdGet$Params {
  employeeId: number;
}

export function apiHumanresourceEmployeeIdGet(http: HttpClient, rootUrl: string, params: ApiHumanresourceEmployeeIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiHumanresourceEmployeeIdGet.PATH, 'get');
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

apiHumanresourceEmployeeIdGet.PATH = '/api/humanresource/{employeeId}';
