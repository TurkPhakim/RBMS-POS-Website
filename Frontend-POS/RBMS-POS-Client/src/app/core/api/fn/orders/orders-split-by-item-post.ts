/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OrderBillResponseModelListBaseResponseModel } from '../../models/order-bill-response-model-list-base-response-model';
import { SplitByItemRequestModel } from '../../models/split-by-item-request-model';

export interface OrdersSplitByItemPost$Params {
  orderId: number;
      body?: SplitByItemRequestModel
}

export function ordersSplitByItemPost(http: HttpClient, rootUrl: string, params: OrdersSplitByItemPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, ordersSplitByItemPost.PATH, 'post');
  if (params) {
    rb.path('orderId', params.orderId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>;
    })
  );
}

ordersSplitByItemPost.PATH = '/api/order/orders/{orderId}/split/by-item';
