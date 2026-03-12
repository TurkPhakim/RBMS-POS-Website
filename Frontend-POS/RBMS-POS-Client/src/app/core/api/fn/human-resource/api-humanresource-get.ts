/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmployeeResponseModelListResponseModel } from '../../models/employee-response-model-list-response-model';

export interface ApiHumanresourceGet$Params {
}

export function apiHumanresourceGet(http: HttpClient, rootUrl: string, params?: ApiHumanresourceGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiHumanresourceGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<EmployeeResponseModelListResponseModel>;
    })
  );
}

apiHumanresourceGet.PATH = '/api/humanresource';
