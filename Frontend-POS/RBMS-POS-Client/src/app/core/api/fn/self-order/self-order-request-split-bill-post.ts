/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObjectBaseResponseModel } from '../../models/object-base-response-model';
import { RequestSplitBillModel } from '../../models/request-split-bill-model';

export interface SelfOrderRequestSplitBillPost$Params {
      body?: RequestSplitBillModel
}

export function selfOrderRequestSplitBillPost(http: HttpClient, rootUrl: string, params?: SelfOrderRequestSplitBillPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, selfOrderRequestSplitBillPost.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/*+json');
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

selfOrderRequestSplitBillPost.PATH = '/api/customer/request-split-bill';
