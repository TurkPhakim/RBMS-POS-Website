/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MenuResponseModelBaseResponseModel } from '../../models/menu-response-model-base-response-model';

export interface MenuItemsGetMenuGet$Params {
  menuId: number;
}

export function menuItemsGetMenuGet(http: HttpClient, rootUrl: string, params: MenuItemsGetMenuGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, menuItemsGetMenuGet.PATH, 'get');
  if (params) {
    rb.path('menuId', params.menuId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<MenuResponseModelBaseResponseModel>;
    })
  );
}

menuItemsGetMenuGet.PATH = '/api/menu/items/{menuId}';
