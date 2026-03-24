/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ChangePasswordRequestModel } from '../../models/change-password-request-model';
import { ObjectBaseResponseModel } from '../../models/object-base-response-model';

export interface AuthChangePasswordPost$Params {
      body?: ChangePasswordRequestModel
}

export function authChangePasswordPost(http: HttpClient, rootUrl: string, params?: AuthChangePasswordPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, authChangePasswordPost.PATH, 'post');
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

authChangePasswordPost.PATH = '/api/admin/auth/change-password';
