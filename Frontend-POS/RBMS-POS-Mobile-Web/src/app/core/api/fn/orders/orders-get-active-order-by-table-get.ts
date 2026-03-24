/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OrderDetailResponseModelBaseResponseModel } from '../../models/order-detail-response-model-base-response-model';

export interface OrdersGetActiveOrderByTableGet$Params {
  tableId: number;
}

export function ordersGetActiveOrderByTableGet(http: HttpClient, rootUrl: string, params: OrdersGetActiveOrderByTableGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, ordersGetActiveOrderByTableGet.PATH, 'get');
  if (params) {
    rb.path('tableId', params.tableId, {});
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

ordersGetActiveOrderByTableGet.PATH = '/api/order/orders/table/{tableId}';
