/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CustomerOrderTrackingResponseModelBaseResponseModel } from '../../models/customer-order-tracking-response-model-base-response-model';

export interface SelfOrderGetOrdersGet$Params {
}

export function selfOrderGetOrdersGet(http: HttpClient, rootUrl: string, params?: SelfOrderGetOrdersGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerOrderTrackingResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, selfOrderGetOrdersGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CustomerOrderTrackingResponseModelBaseResponseModel>;
    })
  );
}

selfOrderGetOrdersGet.PATH = '/api/customer/orders';
