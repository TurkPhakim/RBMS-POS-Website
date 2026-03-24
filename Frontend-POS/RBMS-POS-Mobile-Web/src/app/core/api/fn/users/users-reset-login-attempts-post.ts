/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObjectBaseResponseModel } from '../../models/object-base-response-model';

export interface UsersResetLoginAttemptsPost$Params {
  userId: string;
}

export function usersResetLoginAttemptsPost(http: HttpClient, rootUrl: string, params: UsersResetLoginAttemptsPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, usersResetLoginAttemptsPost.PATH, 'post');
  if (params) {
    rb.path('userId', params.userId, {});
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

usersResetLoginAttemptsPost.PATH = '/api/admin/users/{userId}/reset-login-attempts';
