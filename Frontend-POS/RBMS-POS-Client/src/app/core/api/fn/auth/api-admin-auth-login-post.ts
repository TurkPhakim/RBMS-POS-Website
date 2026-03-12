/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { LoginRequestModel } from '../../models/login-request-model';
import { LoginResponseModelBaseResponseModel } from '../../models/login-response-model-base-response-model';

export interface ApiAdminAuthLoginPost$Params {
      body?: LoginRequestModel
}

export function apiAdminAuthLoginPost(http: HttpClient, rootUrl: string, params?: ApiAdminAuthLoginPost$Params, context?: HttpContext): Observable<StrictHttpResponse<LoginResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminAuthLoginPost.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<LoginResponseModelBaseResponseModel>;
    })
  );
}

apiAdminAuthLoginPost.PATH = '/api/admin/auth/login';
