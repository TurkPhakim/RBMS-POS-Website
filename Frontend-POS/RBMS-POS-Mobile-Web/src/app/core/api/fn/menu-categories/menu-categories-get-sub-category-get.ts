/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MenuSubCategoryResponseModelBaseResponseModel } from '../../models/menu-sub-category-response-model-base-response-model';

export interface MenuCategoriesGetSubCategoryGet$Params {
  subCategoryId: number;
}

export function menuCategoriesGetSubCategoryGet(http: HttpClient, rootUrl: string, params: MenuCategoriesGetSubCategoryGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuSubCategoryResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, menuCategoriesGetSubCategoryGet.PATH, 'get');
  if (params) {
    rb.path('subCategoryId', params.subCategoryId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<MenuSubCategoryResponseModelBaseResponseModel>;
    })
  );
}

menuCategoriesGetSubCategoryGet.PATH = '/api/menu/categories/{subCategoryId}';
