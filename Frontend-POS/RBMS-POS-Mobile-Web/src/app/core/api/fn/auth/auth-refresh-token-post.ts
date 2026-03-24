/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { RefreshTokenRequestModel } from '../../models/refresh-token-request-model';
import { TokenResponseModelBaseResponseModel } from '../../models/token-response-model-base-response-model';

export interface AuthRefreshTokenPost$Params {
      body?: RefreshTokenRequestModel
}

export function authRefreshTokenPost(http: HttpClient, rootUrl: string, params?: AuthRefreshTokenPost$Params, context?: HttpContext): Observable<StrictHttpResponse<TokenResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, authRefreshTokenPost.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TokenResponseModelBaseResponseModel>;
    })
  );
}

authRefreshTokenPost.PATH = '/api/admin/auth/refresh-token';
