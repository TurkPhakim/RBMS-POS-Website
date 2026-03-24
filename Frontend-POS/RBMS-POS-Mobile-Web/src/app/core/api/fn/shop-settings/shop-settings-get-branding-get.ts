/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ShopBrandingResponseModelBaseResponseModel } from '../../models/shop-branding-response-model-base-response-model';

export interface ShopSettingsGetBrandingGet$Params {
}

export function shopSettingsGetBrandingGet(http: HttpClient, rootUrl: string, params?: ShopSettingsGetBrandingGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ShopBrandingResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, shopSettingsGetBrandingGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ShopBrandingResponseModelBaseResponseModel>;
    })
  );
}

shopSettingsGetBrandingGet.PATH = '/api/admin/shop-settings/branding';
