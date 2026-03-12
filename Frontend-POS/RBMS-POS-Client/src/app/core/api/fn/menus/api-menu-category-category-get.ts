/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EMenuCategory } from '../../models/e-menu-category';
import { MenuResponseModelListResponseModel } from '../../models/menu-response-model-list-response-model';

export interface ApiMenuCategoryCategoryGet$Params {
  category: EMenuCategory;
}

export function apiMenuCategoryCategoryGet(http: HttpClient, rootUrl: string, params: ApiMenuCategoryCategoryGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiMenuCategoryCategoryGet.PATH, 'get');
  if (params) {
    rb.path('category', params.category, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<MenuResponseModelListResponseModel>;
    })
  );
}

apiMenuCategoryCategoryGet.PATH = '/api/menu/category/{category}';
