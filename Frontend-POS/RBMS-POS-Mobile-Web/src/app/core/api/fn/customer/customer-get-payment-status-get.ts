/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { StringBaseResponseModel } from '../../models/string-base-response-model';

export interface CustomerGetPaymentStatusGet$Params {
  qrToken: string;
  orderBillId: number;
}

export function customerGetPaymentStatusGet(http: HttpClient, rootUrl: string, params: CustomerGetPaymentStatusGet$Params, context?: HttpContext): Observable<StrictHttpResponse<StringBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, customerGetPaymentStatusGet.PATH, 'get');
  if (params) {
    rb.path('qrToken', params.qrToken, {});
    rb.path('orderBillId', params.orderBillId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<StringBaseResponseModel>;
    })
  );
}

customerGetPaymentStatusGet.PATH = '/api/customer/{qrToken}/bill/{orderBillId}/status';
