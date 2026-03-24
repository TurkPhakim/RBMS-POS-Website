/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { BooleanBaseResponseModel } from '../../models/boolean-base-response-model';
import { VerifyPinRequestModel } from '../../models/verify-pin-request-model';

export interface AuthVerifyPinPost$Params {
      body?: VerifyPinRequestModel
}

export function authVerifyPinPost(http: HttpClient, rootUrl: string, params?: AuthVerifyPinPost$Params, context?: HttpContext): Observable<StrictHttpResponse<BooleanBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, authVerifyPinPost.PATH, 'post');
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

authVerifyPinPost.PATH = '/api/admin/auth/pin/verify';
