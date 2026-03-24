/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SlipUploadResultModelBaseResponseModel } from '../../models/slip-upload-result-model-base-response-model';

export interface PaymentsUploadSlipPost$Params {
      body?: {
'OrderBillId': number;
'PaymentReference'?: string;
'slipFile'?: Blob;
}
}

export function paymentsUploadSlipPost(http: HttpClient, rootUrl: string, params?: PaymentsUploadSlipPost$Params, context?: HttpContext): Observable<StrictHttpResponse<SlipUploadResultModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, paymentsUploadSlipPost.PATH, 'post');
  if (params) {
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

paymentsUploadSlipPost.PATH = '/api/payment/payments/qr/upload-slip';
