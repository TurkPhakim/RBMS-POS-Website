/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { PaymentResponseModelBaseResponseModel } from '../../models/payment-response-model-base-response-model';

export interface PaymentsGetByIdGet$Params {
  paymentId: number;
}

export function paymentsGetByIdGet(http: HttpClient, rootUrl: string, params: PaymentsGetByIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PaymentResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, paymentsGetByIdGet.PATH, 'get');
  if (params) {
    rb.path('paymentId', params.paymentId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<PaymentResponseModelBaseResponseModel>;
    })
  );
}

paymentsGetByIdGet.PATH = '/api/payment/payments/{paymentId}';
