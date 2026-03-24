/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OrderBillResponseModelListBaseResponseModel } from '../../models/order-bill-response-model-list-base-response-model';
import { SplitByAmountRequestModel } from '../../models/split-by-amount-request-model';

export interface OrdersSplitByAmountPost$Params {
  orderId: number;
      body?: SplitByAmountRequestModel
}

export function ordersSplitByAmountPost(http: HttpClient, rootUrl: string, params: OrdersSplitByAmountPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, ordersSplitByAmountPost.PATH, 'post');
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

ordersSplitByAmountPost.PATH = '/api/order/orders/{orderId}/split/by-amount';
