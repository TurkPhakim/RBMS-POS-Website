/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CashierSessionResponseModelBaseResponseModel } from '../../models/cashier-session-response-model-base-response-model';
import { OpenCashierSessionRequestModel } from '../../models/open-cashier-session-request-model';

export interface CashierSessionsOpenSessionPost$Params {
      body?: OpenCashierSessionRequestModel
}

export function cashierSessionsOpenSessionPost(http: HttpClient, rootUrl: string, params?: CashierSessionsOpenSessionPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, cashierSessionsOpenSessionPost.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>;
    })
  );
}

cashierSessionsOpenSessionPost.PATH = '/api/cashier/sessions/open';
