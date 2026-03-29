/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { FloorObjectResponseModelBaseResponseModel } from '../../models/floor-object-response-model-base-response-model';

export interface FloorObjectsGetFloorObjectGet$Params {
  floorObjectId: number;
}

export function floorObjectsGetFloorObjectGet(http: HttpClient, rootUrl: string, params: FloorObjectsGetFloorObjectGet$Params, context?: HttpContext): Observable<StrictHttpResponse<FloorObjectResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, floorObjectsGetFloorObjectGet.PATH, 'get');
  if (params) {
    rb.path('floorObjectId', params.floorObjectId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<FloorObjectResponseModelBaseResponseModel>;
    })
  );
}

floorObjectsGetFloorObjectGet.PATH = '/api/table/floor-objects/{floorObjectId}';
