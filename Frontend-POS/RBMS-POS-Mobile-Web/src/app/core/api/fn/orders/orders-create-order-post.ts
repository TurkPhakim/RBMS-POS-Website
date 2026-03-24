/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateOrderRequestModel } from '../../models/create-order-request-model';
import { OrderDetailResponseModelBaseResponseModel } from '../../models/order-detail-response-model-base-response-model';

export interface OrdersCreateOrderPost$Params {
      body?: CreateOrderRequestModel
}

export function ordersCreateOrderPost(http: HttpClient, rootUrl: string, params?: OrdersCreateOrderPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, ordersCreateOrderPost.PATH, 'post');
  if (params) {
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

ordersCreateOrderPost.PATH = '/api/order/orders';
