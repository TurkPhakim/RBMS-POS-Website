/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TableResponseModelPaginationResult } from '../../models/table-response-model-pagination-result';

export interface TablesGetTablesGet$Params {
  zoneId?: number;
  status?: string;
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
}

export function tablesGetTablesGet(http: HttpClient, rootUrl: string, params?: TablesGetTablesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, tablesGetTablesGet.PATH, 'get');
  if (params) {
    rb.query('zoneId', params.zoneId, {});
    rb.query('status', params.status, {});
    rb.query('Page', params.Page, {});
    rb.query('ItemPerPage', params.ItemPerPage, {});
    rb.query('Search', params.Search, {});
    rb.query('OrderBy', params.OrderBy, {});
    rb.query('IsDescending', params.IsDescending, {});
    rb.query('Skip', params.Skip, {});
    rb.query('Take', params.Take, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TableResponseModelPaginationResult>;
    })
  );
}

tablesGetTablesGet.PATH = '/api/table/tables';
