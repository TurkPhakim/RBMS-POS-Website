/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ServiceChargeResponseModelListResponseModel } from '../../models/service-charge-response-model-list-response-model';

export interface ServiceChargesGetAllGet$Params {
}

export function serviceChargesGetAllGet(http: HttpClient, rootUrl: string, params?: ServiceChargesGetAllGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, serviceChargesGetAllGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ServiceChargeResponseModelListResponseModel>;
    })
  );
}

serviceChargesGetAllGet.PATH = '/api/admin/servicecharges';
