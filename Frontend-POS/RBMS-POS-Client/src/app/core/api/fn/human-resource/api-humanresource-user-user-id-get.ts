/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmployeeResponseModelBaseResponseModel } from '../../models/employee-response-model-base-response-model';

export interface ApiHumanresourceUserUserIdGet$Params {
  userId: string;
}

export function apiHumanresourceUserUserIdGet(http: HttpClient, rootUrl: string, params: ApiHumanresourceUserUserIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiHumanresourceUserUserIdGet.PATH, 'get');
  if (params) {
    rb.path('userId', params.userId, {});
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

apiHumanresourceUserUserIdGet.PATH = '/api/humanresource/user/{userId}';
