/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UpdateZoneRequestModel } from '../../models/update-zone-request-model';
import { ZoneResponseModelBaseResponseModel } from '../../models/zone-response-model-base-response-model';

export interface ZonesUpdateZonePut$Params {
  zoneId: number;
      body?: UpdateZoneRequestModel
}

export function zonesUpdateZonePut(http: HttpClient, rootUrl: string, params: ZonesUpdateZonePut$Params, context?: HttpContext): Observable<StrictHttpResponse<ZoneResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, zonesUpdateZonePut.PATH, 'put');
  if (params) {
    rb.path('zoneId', params.zoneId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ZoneResponseModelBaseResponseModel>;
    })
  );
}

zonesUpdateZonePut.PATH = '/api/table/zones/{zoneId}';
