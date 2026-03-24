/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ServiceChargeResponseModelBaseResponseModel } from '../../models/service-charge-response-model-base-response-model';
import { UpdateServiceChargeRequestModel } from '../../models/update-service-charge-request-model';

export interface ServiceChargesUpdatePut$Params {
  serviceChargeId: number;
      body?: UpdateServiceChargeRequestModel
}

export function serviceChargesUpdatePut(http: HttpClient, rootUrl: string, params: ServiceChargesUpdatePut$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, serviceChargesUpdatePut.PATH, 'put');
  if (params) {
    rb.path('serviceChargeId', params.serviceChargeId, {});
    rb.body(params.body, 'application/*+json');
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

serviceChargesUpdatePut.PATH = '/api/admin/servicecharges/{serviceChargeId}';
