/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ServiceChargeDropdownModelListResponseModel } from '../../models/service-charge-dropdown-model-list-response-model';

export interface ServiceChargesGetDropdownListGet$Params {
}

export function serviceChargesGetDropdownListGet(http: HttpClient, rootUrl: string, params?: ServiceChargesGetDropdownListGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeDropdownModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, serviceChargesGetDropdownListGet.PATH, 'get');
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

serviceChargesGetDropdownListGet.PATH = '/api/admin/servicecharges/dropdown';
