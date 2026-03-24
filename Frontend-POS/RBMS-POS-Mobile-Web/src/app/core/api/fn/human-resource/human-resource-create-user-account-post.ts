/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateUserAccountResponseModelBaseResponseModel } from '../../models/create-user-account-response-model-base-response-model';

export interface HumanResourceCreateUserAccountPost$Params {
  employeeId: number;
}

export function humanResourceCreateUserAccountPost(http: HttpClient, rootUrl: string, params: HumanResourceCreateUserAccountPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CreateUserAccountResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceCreateUserAccountPost.PATH, 'post');
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

humanResourceCreateUserAccountPost.PATH = '/api/humanresource/{employeeId}/create-user';
