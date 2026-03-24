/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CashierSessionResponseModelBaseResponseModel } from '../../models/cashier-session-response-model-base-response-model';
import { CloseCashierSessionRequestModel } from '../../models/close-cashier-session-request-model';

export interface CashierSessionsCloseSessionPost$Params {
  cashierSessionId: number;
      body?: CloseCashierSessionRequestModel
}

export function cashierSessionsCloseSessionPost(http: HttpClient, rootUrl: string, params: CashierSessionsCloseSessionPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, cashierSessionsCloseSessionPost.PATH, 'post');
  if (params) {
    rb.path('cashierSessionId', params.cashierSessionId, {});
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

cashierSessionsCloseSessionPost.PATH = '/api/cashier/sessions/{cashierSessionId}/close';
