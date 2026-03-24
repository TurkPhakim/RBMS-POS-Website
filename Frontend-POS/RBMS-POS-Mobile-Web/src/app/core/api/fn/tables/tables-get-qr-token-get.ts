/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { StringBaseResponseModel } from '../../models/string-base-response-model';

export interface TablesGetQrTokenGet$Params {
  tableId: number;
}

export function tablesGetQrTokenGet(http: HttpClient, rootUrl: string, params: TablesGetQrTokenGet$Params, context?: HttpContext): Observable<StrictHttpResponse<StringBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, tablesGetQrTokenGet.PATH, 'get');
  if (params) {
    rb.path('tableId', params.tableId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<StringBaseResponseModel>;
    })
  );
}

tablesGetQrTokenGet.PATH = '/api/table/tables/{tableId}/qr-token';
