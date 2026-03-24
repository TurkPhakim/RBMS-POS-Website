/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AddOrderItemsRequestModel } from '../../models/add-order-items-request-model';
import { OrderDetailResponseModelBaseResponseModel } from '../../models/order-detail-response-model-base-response-model';

export interface OrdersAddItemsPost$Params {
  orderId: number;
      body?: AddOrderItemsRequestModel
}

export function ordersAddItemsPost(http: HttpClient, rootUrl: string, params: OrdersAddItemsPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, ordersAddItemsPost.PATH, 'post');
  if (params) {
    rb.path('orderId', params.orderId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>;
    })
  );
}

ordersAddItemsPost.PATH = '/api/order/orders/{orderId}/items';
