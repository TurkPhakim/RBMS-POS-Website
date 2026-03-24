/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ForgotPasswordRequestModel } from '../../models/forgot-password-request-model';
import { ForgotPasswordResponseModelBaseResponseModel } from '../../models/forgot-password-response-model-base-response-model';

export interface AuthForgotPasswordPost$Params {
      body?: ForgotPasswordRequestModel
}

export function authForgotPasswordPost(http: HttpClient, rootUrl: string, params?: AuthForgotPasswordPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ForgotPasswordResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, authForgotPasswordPost.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ForgotPasswordResponseModelBaseResponseModel>;
    })
  );
}

authForgotPasswordPost.PATH = '/api/admin/auth/forgot-password';
