/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UpdateGuestCountRequestModel } from '../../models/update-guest-count-request-model';

export interface OrdersUpdateGuestCountPut$Params {
  orderId: number;
      body?: UpdateGuestCountRequestModel
}

export function ordersUpdateGuestCountPut(http: HttpClient, rootUrl: string, params: OrdersUpdateGuestCountPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, ordersUpdateGuestCountPut.PATH, 'put');
  if (params) {
    rb.path('orderId', params.orderId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'text', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
    })
  );
}

ordersUpdateGuestCountPut.PATH = '/api/order/orders/{orderId}/update-guest-count';
