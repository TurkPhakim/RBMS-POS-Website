/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObjectBaseResponseModel } from '../../models/object-base-response-model';

export interface ApiHumanresourceEmployeeIdDelete$Params {
  employeeId: number;
}

export function apiHumanresourceEmployeeIdDelete(http: HttpClient, rootUrl: string, params: ApiHumanresourceEmployeeIdDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiHumanresourceEmployeeIdDelete.PATH, 'delete');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ObjectBaseResponseModel>;
    })
  );
}

apiHumanresourceEmployeeIdDelete.PATH = '/api/humanresource/{employeeId}';
