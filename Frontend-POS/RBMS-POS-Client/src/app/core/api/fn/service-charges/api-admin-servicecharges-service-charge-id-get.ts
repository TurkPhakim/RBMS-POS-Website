/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ServiceChargeResponseModelBaseResponseModel } from '../../models/service-charge-response-model-base-response-model';

export interface ApiAdminServicechargesServiceChargeIdGet$Params {
  serviceChargeId: number;
}

export function apiAdminServicechargesServiceChargeIdGet(http: HttpClient, rootUrl: string, params: ApiAdminServicechargesServiceChargeIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminServicechargesServiceChargeIdGet.PATH, 'get');
  if (params) {
    rb.path('serviceChargeId', params.serviceChargeId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>;
    })
  );
}

apiAdminServicechargesServiceChargeIdGet.PATH = '/api/admin/servicecharges/{serviceChargeId}';
