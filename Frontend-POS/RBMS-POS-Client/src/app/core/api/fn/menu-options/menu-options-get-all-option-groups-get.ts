/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OptionGroupResponseModelPaginationResult } from '../../models/option-group-response-model-pagination-result';

export interface MenuOptionsGetAllOptionGroupsGet$Params {
  categoryType?: number;
  isActive?: boolean;
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
}

export function menuOptionsGetAllOptionGroupsGet(http: HttpClient, rootUrl: string, params?: MenuOptionsGetAllOptionGroupsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OptionGroupResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, menuOptionsGetAllOptionGroupsGet.PATH, 'get');
  if (params) {
    rb.query('categoryType', params.categoryType, {});
    rb.query('isActive', params.isActive, {});
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
      return r as StrictHttpResponse<OptionGroupResponseModelPaginationResult>;
    })
  );
}

menuOptionsGetAllOptionGroupsGet.PATH = '/api/menu/options';
