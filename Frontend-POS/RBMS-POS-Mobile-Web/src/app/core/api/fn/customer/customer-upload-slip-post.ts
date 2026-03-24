/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SlipUploadResultModelBaseResponseModel } from '../../models/slip-upload-result-model-base-response-model';

export interface CustomerUploadSlipPost$Params {
  qrToken: string;
      body?: {
'OrderBillId': number;
'PaymentReference'?: string;
'slipFile'?: Blob;
}
}

export function customerUploadSlipPost(http: HttpClient, rootUrl: string, params: CustomerUploadSlipPost$Params, context?: HttpContext): Observable<StrictHttpResponse<SlipUploadResultModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, customerUploadSlipPost.PATH, 'post');
  if (params) {
    rb.path('qrToken', params.qrToken, {});
    rb.body(params.body, 'multipart/form-data');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SlipUploadResultModelBaseResponseModel>;
    })
  );
}

customerUploadSlipPost.PATH = '/api/customer/{qrToken}/upload-slip';
