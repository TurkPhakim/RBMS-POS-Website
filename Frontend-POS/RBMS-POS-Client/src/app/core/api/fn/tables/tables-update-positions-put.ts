/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UpdateTablePositionsRequestModel } from '../../models/update-table-positions-request-model';

export interface TablesUpdatePositionsPut$Params {
      body?: UpdateTablePositionsRequestModel
}

export function tablesUpdatePositionsPut(http: HttpClient, rootUrl: string, params?: TablesUpdatePositionsPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, tablesUpdatePositionsPut.PATH, 'put');
  if (params) {
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'text', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
    })
  );
}

tablesUpdatePositionsPut.PATH = '/api/table/tables/positions';
