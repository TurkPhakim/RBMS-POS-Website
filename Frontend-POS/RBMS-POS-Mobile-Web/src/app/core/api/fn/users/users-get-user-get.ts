/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserDetailResponseModelBaseResponseModel } from '../../models/user-detail-response-model-base-response-model';

export interface UsersGetUserGet$Params {
  userId: string;
}

export function usersGetUserGet(http: HttpClient, rootUrl: string, params: UsersGetUserGet$Params, context?: HttpContext): Observable<StrictHttpResponse<UserDetailResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, usersGetUserGet.PATH, 'get');
  if (params) {
    rb.path('userId', params.userId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UserDetailResponseModelBaseResponseModel>;
    })
  );
}

usersGetUserGet.PATH = '/api/admin/users/{userId}';
