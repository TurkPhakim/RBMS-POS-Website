/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmployeeResponseModelListResponseModel } from '../../models/employee-response-model-list-response-model';

export interface ApiHumanresourceSearchGet$Params {
  searchTerm?: string;
}

export function apiHumanresourceSearchGet(http: HttpClient, rootUrl: string, params?: ApiHumanresourceSearchGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiHumanresourceSearchGet.PATH, 'get');
  if (params) {
    rb.query('searchTerm', params.searchTerm, {});
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

apiHumanresourceSearchGet.PATH = '/api/humanresource/search';
