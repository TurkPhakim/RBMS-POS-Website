/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { RefreshTokenRequestModel } from '../../models/refresh-token-request-model';
import { TokenResponseModelBaseResponseModel } from '../../models/token-response-model-base-response-model';

export interface ApiAdminAuthRefreshTokenPost$Params {
      body?: RefreshTokenRequestModel
}

export function apiAdminAuthRefreshTokenPost(http: HttpClient, rootUrl: string, params?: ApiAdminAuthRefreshTokenPost$Params, context?: HttpContext): Observable<StrictHttpResponse<TokenResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminAuthRefreshTokenPost.PATH, 'post');
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

apiAdminAuthRefreshTokenPost.PATH = '/api/admin/auth/refresh-token';
