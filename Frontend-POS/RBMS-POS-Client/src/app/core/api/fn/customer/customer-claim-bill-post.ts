/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ClaimBillRequestModel } from '../../models/claim-bill-request-model';
import { ObjectBaseResponseModel } from '../../models/object-base-response-model';

export interface CustomerClaimBillPost$Params {
  qrToken: string;
  orderBillId: number;
      body?: ClaimBillRequestModel
}

export function customerClaimBillPost(http: HttpClient, rootUrl: string, params: CustomerClaimBillPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, customerClaimBillPost.PATH, 'post');
  if (params) {
    rb.path('qrToken', params.qrToken, {});
    rb.path('orderBillId', params.orderBillId, {});
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

customerClaimBillPost.PATH = '/api/customer/{qrToken}/bills/{orderBillId}/claim';
