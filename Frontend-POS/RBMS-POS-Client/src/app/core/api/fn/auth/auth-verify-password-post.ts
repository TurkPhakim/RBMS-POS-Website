/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { BooleanBaseResponseModel } from '../../models/boolean-base-response-model';
import { VerifyPasswordRequestModel } from '../../models/verify-password-request-model';

export interface AuthVerifyPasswordPost$Params {
      body?: VerifyPasswordRequestModel
}

export function authVerifyPasswordPost(http: HttpClient, rootUrl: string, params?: AuthVerifyPasswordPost$Params, context?: HttpContext): Observable<StrictHttpResponse<BooleanBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, authVerifyPasswordPost.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<BooleanBaseResponseModel>;
    })
  );
}

authVerifyPasswordPost.PATH = '/api/admin/auth/verify-password';
