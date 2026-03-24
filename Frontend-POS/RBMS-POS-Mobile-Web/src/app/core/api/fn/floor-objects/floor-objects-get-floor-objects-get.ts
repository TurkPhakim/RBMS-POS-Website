/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { FloorObjectResponseModelListResponseModel } from '../../models/floor-object-response-model-list-response-model';

export interface FloorObjectsGetFloorObjectsGet$Params {
  zoneId?: number;
}

export function floorObjectsGetFloorObjectsGet(http: HttpClient, rootUrl: string, params?: FloorObjectsGetFloorObjectsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<FloorObjectResponseModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, floorObjectsGetFloorObjectsGet.PATH, 'get');
  if (params) {
    rb.query('zoneId', params.zoneId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<FloorObjectResponseModelListResponseModel>;
    })
  );
}

floorObjectsGetFloorObjectsGet.PATH = '/api/table/floor-objects';
