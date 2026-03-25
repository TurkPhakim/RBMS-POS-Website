/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ReceiptDataModelBaseResponseModel } from '../../models/receipt-data-model-base-response-model';

export interface SelfOrderGetConsolidatedReceiptGet$Params {
}

export function selfOrderGetConsolidatedReceiptGet(http: HttpClient, rootUrl: string, params?: SelfOrderGetConsolidatedReceiptGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReceiptDataModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, selfOrderGetConsolidatedReceiptGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ReceiptDataModelBaseResponseModel>;
    })
  );
}

selfOrderGetConsolidatedReceiptGet.PATH = '/api/customer/consolidated-receipt';
