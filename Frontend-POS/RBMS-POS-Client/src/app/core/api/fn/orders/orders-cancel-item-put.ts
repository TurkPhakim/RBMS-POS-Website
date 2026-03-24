/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CancelOrderItemRequestModel } from '../../models/cancel-order-item-request-model';

export interface OrdersCancelItemPut$Params {
  orderItemId: number;
      body?: CancelOrderItemRequestModel
}

export function ordersCancelItemPut(http: HttpClient, rootUrl: string, params: OrdersCancelItemPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, ordersCancelItemPut.PATH, 'put');
  if (params) {
    rb.path('orderItemId', params.orderItemId, {});
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

ordersCancelItemPut.PATH = '/api/order/orders/items/{orderItemId}/cancel';
