/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CashierSessionResponseModelPaginationResult } from '../../models/cashier-session-response-model-pagination-result';

export interface CashierSessionsGetSessionHistoryGet$Params {
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
  dateFrom?: string;
  dateTo?: string;
  shiftPeriod?: number;
}

export function cashierSessionsGetSessionHistoryGet(http: HttpClient, rootUrl: string, params?: CashierSessionsGetSessionHistoryGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, cashierSessionsGetSessionHistoryGet.PATH, 'get');
  if (params) {
    rb.query('Page', params.Page, {});
    rb.query('ItemPerPage', params.ItemPerPage, {});
    rb.query('Search', params.Search, {});
    rb.query('OrderBy', params.OrderBy, {});
    rb.query('IsDescending', params.IsDescending, {});
    rb.query('Skip', params.Skip, {});
    rb.query('Take', params.Take, {});
    rb.query('dateFrom', params.dateFrom, {});
    rb.query('dateTo', params.dateTo, {});
    rb.query('shiftPeriod', params.shiftPeriod, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CashierSessionResponseModelPaginationResult>;
    })
  );
}

cashierSessionsGetSessionHistoryGet.PATH = '/api/cashier/sessions/history';
