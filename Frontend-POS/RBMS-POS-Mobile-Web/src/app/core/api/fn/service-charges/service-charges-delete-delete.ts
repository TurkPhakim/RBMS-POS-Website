/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObjectBaseResponseModel } from '../../models/object-base-response-model';

export interface ServiceChargesDeleteDelete$Params {
  serviceChargeId: number;
}

export function serviceChargesDeleteDelete(http: HttpClient, rootUrl: string, params: ServiceChargesDeleteDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, serviceChargesDeleteDelete.PATH, 'delete');
  if (params) {
    rb.path('serviceChargeId', params.serviceChargeId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ObjectBaseResponseModel>;
    })
  );
}

serviceChargesDeleteDelete.PATH = '/api/admin/servicecharges/{serviceChargeId}';
