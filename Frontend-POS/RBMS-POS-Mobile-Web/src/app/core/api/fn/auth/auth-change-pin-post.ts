/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ChangePinRequestModel } from '../../models/change-pin-request-model';
import { ObjectBaseResponseModel } from '../../models/object-base-response-model';

export interface AuthChangePinPost$Params {
      body?: ChangePinRequestModel
}

export function authChangePinPost(http: HttpClient, rootUrl: string, params?: AuthChangePinPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, authChangePinPost.PATH, 'post');
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

authChangePinPost.PATH = '/api/admin/auth/pin/change';
