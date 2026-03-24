/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MenuResponseModelBaseResponseModel } from '../../models/menu-response-model-base-response-model';

export interface MenuItemsUpdateMenuPut$Params {
  menuId: number;
      body?: {
'NameThai': string;
'NameEnglish': string;
'Description'?: string;
'SubCategoryId': number;
'Price': number;
'CostPrice'?: number;
'IsAvailablePeriod1'?: boolean;
'IsAvailablePeriod2'?: boolean;
'Tags'?: number;
'Allergens'?: string;
'CaloriesPerServing'?: number;
'IsAvailable'?: boolean;
'IsPinned'?: boolean;
'RemoveImage'?: boolean;
'OptionGroupIds'?: Array<number>;
'imageFile'?: Blob;
}
}

export function menuItemsUpdateMenuPut(http: HttpClient, rootUrl: string, params: MenuItemsUpdateMenuPut$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, menuItemsUpdateMenuPut.PATH, 'put');
  if (params) {
    rb.path('menuId', params.menuId, {});
    rb.body(params.body, 'multipart/form-data');
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

menuItemsUpdateMenuPut.PATH = '/api/menu/items/{menuId}';
