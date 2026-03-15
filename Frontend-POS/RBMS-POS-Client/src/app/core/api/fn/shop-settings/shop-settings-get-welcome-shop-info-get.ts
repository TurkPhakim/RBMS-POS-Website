/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { WelcomeShopInfoResponseModelBaseResponseModel } from '../../models/welcome-shop-info-response-model-base-response-model';

export interface ShopSettingsGetWelcomeShopInfoGet$Params {
}

export function shopSettingsGetWelcomeShopInfoGet(http: HttpClient, rootUrl: string, params?: ShopSettingsGetWelcomeShopInfoGet$Params, context?: HttpContext): Observable<StrictHttpResponse<WelcomeShopInfoResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, shopSettingsGetWelcomeShopInfoGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<WelcomeShopInfoResponseModelBaseResponseModel>;
    })
  );
}

shopSettingsGetWelcomeShopInfoGet.PATH = '/api/admin/shop-settings/welcome';
