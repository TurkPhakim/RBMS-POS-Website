/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateServiceChargeRequestModel } from '../../models/create-service-charge-request-model';
import { ServiceChargeResponseModelBaseResponseModel } from '../../models/service-charge-response-model-base-response-model';

export interface ServiceChargesCreatePost$Params {
      body?: CreateServiceChargeRequestModel
}

export function serviceChargesCreatePost(http: HttpClient, rootUrl: string, params?: ServiceChargesCreatePost$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, serviceChargesCreatePost.PATH, 'post');
  if (params) {
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

serviceChargesCreatePost.PATH = '/api/admin/servicecharges';
