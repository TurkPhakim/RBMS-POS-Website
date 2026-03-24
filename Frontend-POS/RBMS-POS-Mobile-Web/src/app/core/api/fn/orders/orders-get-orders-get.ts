/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OrderResponseModelPaginationResult } from '../../models/order-response-model-pagination-result';

export interface OrdersGetOrdersGet$Params {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  zoneId?: number;
  tableId?: number;
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
}

export function ordersGetOrdersGet(http: HttpClient, rootUrl: string, params?: OrdersGetOrdersGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, ordersGetOrdersGet.PATH, 'get');
  if (params) {
    rb.query('dateFrom', params.dateFrom, {});
    rb.query('dateTo', params.dateTo, {});
    rb.query('status', params.status, {});
    rb.query('zoneId', params.zoneId, {});
    rb.query('tableId', params.tableId, {});
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
      return r as StrictHttpResponse<OrderResponseModelPaginationResult>;
    })
  );
}

ordersGetOrdersGet.PATH = '/api/order/orders';
