/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObjectBaseResponseModel } from '../../models/object-base-response-model';
import { SetupPinRequestModel } from '../../models/setup-pin-request-model';

export interface AuthSetupPinPost$Params {
      body?: SetupPinRequestModel
}

export function authSetupPinPost(http: HttpClient, rootUrl: string, params?: AuthSetupPinPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, authSetupPinPost.PATH, 'post');
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

authSetupPinPost.PATH = '/api/admin/auth/pin/setup';
