/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EMenuCategory } from '../../models/e-menu-category';
import { MenuResponseModelBaseResponseModel } from '../../models/menu-response-model-base-response-model';

export interface MenusUpdatePut$Params {
  menuId: number;
      body?: {
'NameThai': string;
'NameEnglish': string;
'Description'?: string;
'Price': number;
'Category': EMenuCategory;
'IsActive'?: boolean;
'IsAvailable'?: boolean;
'imageFile'?: Blob;
}
}

export function menusUpdatePut(http: HttpClient, rootUrl: string, params: MenusUpdatePut$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, menusUpdatePut.PATH, 'put');
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

menusUpdatePut.PATH = '/api/menu/{menuId}';
