/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface OrdersSendItemToKitchenPost$Params {
  orderItemId: number;
}

export function ordersSendItemToKitchenPost(http: HttpClient, rootUrl: string, params: OrdersSendItemToKitchenPost$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, ordersSendItemToKitchenPost.PATH, 'post');
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

ordersSendItemToKitchenPost.PATH = '/api/order/orders/items/{orderItemId}/send-kitchen';
