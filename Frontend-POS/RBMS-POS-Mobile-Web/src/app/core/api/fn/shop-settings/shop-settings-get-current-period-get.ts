/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CurrentPeriodResultModelBaseResponseModel } from '../../models/current-period-result-model-base-response-model';

export interface ShopSettingsGetCurrentPeriodGet$Params {
}

export function shopSettingsGetCurrentPeriodGet(http: HttpClient, rootUrl: string, params?: ShopSettingsGetCurrentPeriodGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CurrentPeriodResultModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, shopSettingsGetCurrentPeriodGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CurrentPeriodResultModelBaseResponseModel>;
    })
  );
}

shopSettingsGetCurrentPeriodGet.PATH = '/api/admin/shop-settings/current-period';
