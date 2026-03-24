/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OrderBillResponseModelListBaseResponseModel } from '../../models/order-bill-response-model-list-base-response-model';

export interface OrdersGetBillsGet$Params {
  orderId: number;
}

export function ordersGetBillsGet(http: HttpClient, rootUrl: string, params: OrdersGetBillsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, ordersGetBillsGet.PATH, 'get');
  if (params) {
    rb.path('orderId', params.orderId, {});
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

ordersGetBillsGet.PATH = '/api/order/orders/{orderId}/bills';
