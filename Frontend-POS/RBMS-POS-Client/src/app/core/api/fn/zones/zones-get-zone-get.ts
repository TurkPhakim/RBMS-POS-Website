/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ZoneResponseModelBaseResponseModel } from '../../models/zone-response-model-base-response-model';

export interface ZonesGetZoneGet$Params {
  zoneId: number;
}

export function zonesGetZoneGet(http: HttpClient, rootUrl: string, params: ZonesGetZoneGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ZoneResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, zonesGetZoneGet.PATH, 'get');
  if (params) {
    rb.path('zoneId', params.zoneId, {});
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

zonesGetZoneGet.PATH = '/api/table/zones/{zoneId}';
