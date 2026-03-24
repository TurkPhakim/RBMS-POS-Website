/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MoveTableRequestModel } from '../../models/move-table-request-model';
import { TableResponseModelBaseResponseModel } from '../../models/table-response-model-base-response-model';

export interface TablesMoveTablePost$Params {
  tableId: number;
      body?: MoveTableRequestModel
}

export function tablesMoveTablePost(http: HttpClient, rootUrl: string, params: TablesMoveTablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, tablesMoveTablePost.PATH, 'post');
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

tablesMoveTablePost.PATH = '/api/table/tables/{tableId}/move';
