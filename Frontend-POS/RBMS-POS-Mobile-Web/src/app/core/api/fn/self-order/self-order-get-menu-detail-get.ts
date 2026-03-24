/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CustomerMenuDetailResponseModelBaseResponseModel } from '../../models/customer-menu-detail-response-model-base-response-model';

export interface SelfOrderGetMenuDetailGet$Params {
  menuId: number;
}

export function selfOrderGetMenuDetailGet(http: HttpClient, rootUrl: string, params: SelfOrderGetMenuDetailGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerMenuDetailResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, selfOrderGetMenuDetailGet.PATH, 'get');
  if (params) {
    rb.path('menuId', params.menuId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CustomerMenuDetailResponseModelBaseResponseModel>;
    })
  );
}

selfOrderGetMenuDetailGet.PATH = '/api/customer/menu/items/{menuId}';
