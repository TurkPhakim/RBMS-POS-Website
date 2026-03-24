/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CustomerMenuItemResponseModelListBaseResponseModel } from '../../models/customer-menu-item-response-model-list-base-response-model';

export interface SelfOrderGetMenuItemsGet$Params {
  categoryType?: number;
  subCategoryId?: number;
  search?: string;
}

export function selfOrderGetMenuItemsGet(http: HttpClient, rootUrl: string, params?: SelfOrderGetMenuItemsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerMenuItemResponseModelListBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, selfOrderGetMenuItemsGet.PATH, 'get');
  if (params) {
    rb.query('categoryType', params.categoryType, {});
    rb.query('subCategoryId', params.subCategoryId, {});
    rb.query('search', params.search, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CustomerMenuItemResponseModelListBaseResponseModel>;
    })
  );
}

selfOrderGetMenuItemsGet.PATH = '/api/customer/menu/items';
