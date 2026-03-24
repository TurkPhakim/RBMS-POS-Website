/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { PositionResponseModelPaginationResult } from '../../models/position-response-model-pagination-result';

export interface PositionsGetPositionsGet$Params {
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
  isActive?: boolean;
}

export function positionsGetPositionsGet(http: HttpClient, rootUrl: string, params?: PositionsGetPositionsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, positionsGetPositionsGet.PATH, 'get');
  if (params) {
    rb.query('Page', params.Page, {});
    rb.query('ItemPerPage', params.ItemPerPage, {});
    rb.query('Search', params.Search, {});
    rb.query('OrderBy', params.OrderBy, {});
    rb.query('IsDescending', params.IsDescending, {});
    rb.query('Skip', params.Skip, {});
    rb.query('Take', params.Take, {});
    rb.query('isActive', params.isActive, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<PositionResponseModelPaginationResult>;
    })
  );
}

positionsGetPositionsGet.PATH = '/api/admin/positions';
