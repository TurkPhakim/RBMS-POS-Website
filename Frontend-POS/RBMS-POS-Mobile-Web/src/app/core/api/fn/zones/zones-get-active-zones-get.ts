/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ZoneResponseModelListResponseModel } from '../../models/zone-response-model-list-response-model';

export interface ZonesGetActiveZonesGet$Params {
}

export function zonesGetActiveZonesGet(http: HttpClient, rootUrl: string, params?: ZonesGetActiveZonesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ZoneResponseModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, zonesGetActiveZonesGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ZoneResponseModelListResponseModel>;
    })
  );
}

zonesGetActiveZonesGet.PATH = '/api/table/zones/active';
