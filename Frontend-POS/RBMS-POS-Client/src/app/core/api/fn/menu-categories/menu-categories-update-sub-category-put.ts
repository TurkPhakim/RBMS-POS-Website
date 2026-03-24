/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MenuSubCategoryResponseModelBaseResponseModel } from '../../models/menu-sub-category-response-model-base-response-model';
import { UpdateMenuSubCategoryRequestModel } from '../../models/update-menu-sub-category-request-model';

export interface MenuCategoriesUpdateSubCategoryPut$Params {
  subCategoryId: number;
      body?: UpdateMenuSubCategoryRequestModel
}

export function menuCategoriesUpdateSubCategoryPut(http: HttpClient, rootUrl: string, params: MenuCategoriesUpdateSubCategoryPut$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuSubCategoryResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, menuCategoriesUpdateSubCategoryPut.PATH, 'put');
  if (params) {
    rb.path('subCategoryId', params.subCategoryId, {});
    rb.body(params.body, 'application/*+json');
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

menuCategoriesUpdateSubCategoryPut.PATH = '/api/menu/categories/{subCategoryId}';
