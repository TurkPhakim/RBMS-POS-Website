/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ReceiptDataModelBaseResponseModel } from '../../models/receipt-data-model-base-response-model';

export interface PaymentsGetReceiptDataGet$Params {
  paymentId: number;
}

export function paymentsGetReceiptDataGet(http: HttpClient, rootUrl: string, params: PaymentsGetReceiptDataGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReceiptDataModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, paymentsGetReceiptDataGet.PATH, 'get');
  if (params) {
    rb.path('paymentId', params.paymentId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ReceiptDataModelBaseResponseModel>;
    })
  );
}

paymentsGetReceiptDataGet.PATH = '/api/payment/payments/{paymentId}/receipt';
