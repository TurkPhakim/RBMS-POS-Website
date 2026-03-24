/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CashDrawerTransactionRequestModel } from '../../models/cash-drawer-transaction-request-model';
import { CashierSessionResponseModelBaseResponseModel } from '../../models/cashier-session-response-model-base-response-model';

export interface CashierSessionsCashOutPost$Params {
  cashierSessionId: number;
      body?: CashDrawerTransactionRequestModel
}

export function cashierSessionsCashOutPost(http: HttpClient, rootUrl: string, params: CashierSessionsCashOutPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, cashierSessionsCashOutPost.PATH, 'post');
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

cashierSessionsCashOutPost.PATH = '/api/cashier/sessions/{cashierSessionId}/cash-out';
