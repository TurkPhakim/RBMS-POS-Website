/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CustomerBillResponseModelBaseResponseModel } from '../../models/customer-bill-response-model-base-response-model';

export interface CustomerGetBillGet$Params {
  qrToken: string;
}

export function customerGetBillGet(http: HttpClient, rootUrl: string, params: CustomerGetBillGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerBillResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, customerGetBillGet.PATH, 'get');
  if (params) {
    rb.path('qrToken', params.qrToken, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CustomerBillResponseModelBaseResponseModel>;
    })
  );
}

customerGetBillGet.PATH = '/api/customer/{qrToken}/bill';
