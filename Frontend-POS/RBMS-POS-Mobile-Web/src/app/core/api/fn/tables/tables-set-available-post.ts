/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TableResponseModelBaseResponseModel } from '../../models/table-response-model-base-response-model';

export interface TablesSetAvailablePost$Params {
  tableId: number;
}

export function tablesSetAvailablePost(http: HttpClient, rootUrl: string, params: TablesSetAvailablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, tablesSetAvailablePost.PATH, 'post');
  if (params) {
    rb.path('tableId', params.tableId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TableResponseModelBaseResponseModel>;
    })
  );
}

tablesSetAvailablePost.PATH = '/api/table/tables/{tableId}/set-available';
