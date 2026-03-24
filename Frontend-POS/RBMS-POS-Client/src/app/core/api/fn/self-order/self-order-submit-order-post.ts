/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CustomerOrderResponseModelBaseResponseModel } from '../../models/customer-order-response-model-base-response-model';
import { CustomerSubmitOrderRequestModel } from '../../models/customer-submit-order-request-model';

export interface SelfOrderSubmitOrderPost$Params {
      body?: CustomerSubmitOrderRequestModel
}

export function selfOrderSubmitOrderPost(http: HttpClient, rootUrl: string, params?: SelfOrderSubmitOrderPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerOrderResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, selfOrderSubmitOrderPost.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CustomerOrderResponseModelBaseResponseModel>;
    })
  );
}

selfOrderSubmitOrderPost.PATH = '/api/customer/orders';
