/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ServiceChargeDropdownModelListResponseModel } from '../../models/service-charge-dropdown-model-list-response-model';

export interface ApiAdminServicechargesDropdownGet$Params {
}

export function apiAdminServicechargesDropdownGet(http: HttpClient, rootUrl: string, params?: ApiAdminServicechargesDropdownGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeDropdownModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminServicechargesDropdownGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ServiceChargeDropdownModelListResponseModel>;
    })
  );
}

apiAdminServicechargesDropdownGet.PATH = '/api/admin/servicecharges/dropdown';
