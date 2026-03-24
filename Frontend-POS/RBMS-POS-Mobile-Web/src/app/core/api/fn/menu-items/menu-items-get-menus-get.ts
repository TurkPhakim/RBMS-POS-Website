/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MenuResponseModelPaginationResult } from '../../models/menu-response-model-pagination-result';

export interface MenuItemsGetMenusGet$Params {
  categoryType?: number;
  subCategoryId?: number;
  search?: string;
  isAvailable?: boolean;
  period?: string;
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
}

export function menuItemsGetMenusGet(http: HttpClient, rootUrl: string, params?: MenuItemsGetMenusGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, menuItemsGetMenusGet.PATH, 'get');
  if (params) {
    rb.query('categoryType', params.categoryType, {});
    rb.query('subCategoryId', params.subCategoryId, {});
    rb.query('search', params.search, {});
    rb.query('isAvailable', params.isAvailable, {});
    rb.query('period', params.period, {});
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
      return r as StrictHttpResponse<MenuResponseModelPaginationResult>;
    })
  );
}

menuItemsGetMenusGet.PATH = '/api/menu/items';
