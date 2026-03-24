/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TableResponseModelBaseResponseModel } from '../../models/table-response-model-base-response-model';
import { UpdateTableRequestModel } from '../../models/update-table-request-model';

export interface TablesUpdateTablePut$Params {
  tableId: number;
      body?: UpdateTableRequestModel
}

export function tablesUpdateTablePut(http: HttpClient, rootUrl: string, params: TablesUpdateTablePut$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, tablesUpdateTablePut.PATH, 'put');
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

tablesUpdateTablePut.PATH = '/api/table/tables/{tableId}';
