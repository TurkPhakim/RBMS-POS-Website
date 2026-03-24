/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObjectBaseResponseModel } from '../../models/object-base-response-model';
import { ResetPasswordRequestModel } from '../../models/reset-password-request-model';

export interface AuthResetPasswordPost$Params {
      body?: ResetPasswordRequestModel
}

export function authResetPasswordPost(http: HttpClient, rootUrl: string, params?: AuthResetPasswordPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, authResetPasswordPost.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/*+json');
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

authResetPasswordPost.PATH = '/api/admin/auth/reset-password';
