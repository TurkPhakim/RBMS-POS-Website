/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateZoneRequestModel } from '../../models/create-zone-request-model';
import { ZoneResponseModelBaseResponseModel } from '../../models/zone-response-model-base-response-model';

export interface ZonesCreateZonePost$Params {
      body?: CreateZoneRequestModel
}

export function zonesCreateZonePost(http: HttpClient, rootUrl: string, params?: ZonesCreateZonePost$Params, context?: HttpContext): Observable<StrictHttpResponse<ZoneResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, zonesCreateZonePost.PATH, 'post');
  if (params) {
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

zonesCreateZonePost.PATH = '/api/table/zones';
