/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateUserAccountResponseModelBaseResponseModel } from '../../models/create-user-account-response-model-base-response-model';

export interface ApiHumanresourceEmployeeIdCreateUserPost$Params {
  employeeId: number;
}

export function apiHumanresourceEmployeeIdCreateUserPost(http: HttpClient, rootUrl: string, params: ApiHumanresourceEmployeeIdCreateUserPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CreateUserAccountResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiHumanresourceEmployeeIdCreateUserPost.PATH, 'post');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CreateUserAccountResponseModelBaseResponseModel>;
    })
  );
}

apiHumanresourceEmployeeIdCreateUserPost.PATH = '/api/humanresource/{employeeId}/create-user';
