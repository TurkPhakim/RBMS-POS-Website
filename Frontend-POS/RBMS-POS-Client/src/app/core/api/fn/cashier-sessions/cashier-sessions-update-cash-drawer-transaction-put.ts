/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CashDrawerTransactionRequestModel } from '../../models/cash-drawer-transaction-request-model';
import { CashierSessionResponseModelBaseResponseModel } from '../../models/cashier-session-response-model-base-response-model';

export interface CashierSessionsUpdateCashDrawerTransactionPut$Params {
  cashierSessionId: number;
  cashDrawerTransactionId: number;
      body?: CashDrawerTransactionRequestModel
}

export function cashierSessionsUpdateCashDrawerTransactionPut(http: HttpClient, rootUrl: string, params: CashierSessionsUpdateCashDrawerTransactionPut$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, cashierSessionsUpdateCashDrawerTransactionPut.PATH, 'put');
  if (params) {
    rb.path('cashierSessionId', params.cashierSessionId, {});
    rb.path('cashDrawerTransactionId', params.cashDrawerTransactionId, {});
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

cashierSessionsUpdateCashDrawerTransactionPut.PATH = '/api/cashier/sessions/{cashierSessionId}/cash-drawer/{cashDrawerTransactionId}';
