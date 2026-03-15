/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MenuResponseModelListResponseModel } from '../../models/menu-response-model-list-response-model';

export interface MenusGetAvailableGet$Params {
}

export function menusGetAvailableGet(http: HttpClient, rootUrl: string, params?: MenusGetAvailableGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, menusGetAvailableGet.PATH, 'get');
  if (params) {
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

menusGetAvailableGet.PATH = '/api/menu/available';
