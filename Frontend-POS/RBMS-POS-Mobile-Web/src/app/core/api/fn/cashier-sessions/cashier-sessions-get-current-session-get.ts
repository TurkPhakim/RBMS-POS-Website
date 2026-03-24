/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CashierSessionResponseModelBaseResponseModel } from '../../models/cashier-session-response-model-base-response-model';

export interface CashierSessionsGetCurrentSessionGet$Params {
}

export function cashierSessionsGetCurrentSessionGet(http: HttpClient, rootUrl: string, params?: CashierSessionsGetCurrentSessionGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, cashierSessionsGetCurrentSessionGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>;
    })
  );
}

cashierSessionsGetCurrentSessionGet.PATH = '/api/cashier/sessions/current';
