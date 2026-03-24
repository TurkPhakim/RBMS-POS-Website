/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface OrdersVoidItemPut$Params {
  orderItemId: number;
}

export function ordersVoidItemPut(http: HttpClient, rootUrl: string, params: OrdersVoidItemPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, ordersVoidItemPut.PATH, 'put');
  if (params) {
    rb.path('orderItemId', params.orderItemId, {});
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

ordersVoidItemPut.PATH = '/api/order/orders/items/{orderItemId}/void';
