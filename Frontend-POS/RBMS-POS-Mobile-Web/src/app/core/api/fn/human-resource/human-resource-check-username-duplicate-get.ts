/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { BooleanBaseResponseModel } from '../../models/boolean-base-response-model';

export interface HumanResourceCheckUsernameDuplicateGet$Params {
  username?: string;
}

export function humanResourceCheckUsernameDuplicateGet(http: HttpClient, rootUrl: string, params?: HumanResourceCheckUsernameDuplicateGet$Params, context?: HttpContext): Observable<StrictHttpResponse<BooleanBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceCheckUsernameDuplicateGet.PATH, 'get');
  if (params) {
    rb.query('username', params.username, {});
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

humanResourceCheckUsernameDuplicateGet.PATH = '/api/humanresource/me/check-username';
