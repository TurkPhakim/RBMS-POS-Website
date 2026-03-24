/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObjectBaseResponseModel } from '../../models/object-base-response-model';

export interface SelfOrderRequestCashPaymentPost$Params {
}

export function selfOrderRequestCashPaymentPost(http: HttpClient, rootUrl: string, params?: SelfOrderRequestCashPaymentPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, selfOrderRequestCashPaymentPost.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ObjectBaseResponseModel>;
    })
  );
}

selfOrderRequestCashPaymentPost.PATH = '/api/customer/request-cash';
