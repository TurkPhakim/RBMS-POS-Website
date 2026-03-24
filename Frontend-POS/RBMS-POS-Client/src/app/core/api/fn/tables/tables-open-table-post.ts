/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OpenTableRequestModel } from '../../models/open-table-request-model';
import { TableResponseModelBaseResponseModel } from '../../models/table-response-model-base-response-model';

export interface TablesOpenTablePost$Params {
  tableId: number;
      body?: OpenTableRequestModel
}

export function tablesOpenTablePost(http: HttpClient, rootUrl: string, params: TablesOpenTablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, tablesOpenTablePost.PATH, 'post');
  if (params) {
    rb.path('tableId', params.tableId, {});
    rb.body(params.body, 'application/*+json');
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

tablesOpenTablePost.PATH = '/api/table/tables/{tableId}/open';
