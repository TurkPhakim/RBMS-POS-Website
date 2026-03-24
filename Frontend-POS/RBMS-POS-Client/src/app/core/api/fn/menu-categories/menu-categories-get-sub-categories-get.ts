/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MenuSubCategoryResponseModelPaginationResult } from '../../models/menu-sub-category-response-model-pagination-result';

export interface MenuCategoriesGetSubCategoriesGet$Params {
  categoryType: number;
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
}

export function menuCategoriesGetSubCategoriesGet(http: HttpClient, rootUrl: string, params: MenuCategoriesGetSubCategoriesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuSubCategoryResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, menuCategoriesGetSubCategoriesGet.PATH, 'get');
  if (params) {
    rb.path('categoryType', params.categoryType, {});
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
      return r as StrictHttpResponse<MenuSubCategoryResponseModelPaginationResult>;
    })
  );
}

menuCategoriesGetSubCategoriesGet.PATH = '/api/menu/categories/type/{categoryType}';
