/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { FloorObjectResponseModelBaseResponseModel } from '../../models/floor-object-response-model-base-response-model';
import { UpdateFloorObjectRequestModel } from '../../models/update-floor-object-request-model';

export interface FloorObjectsUpdateFloorObjectPut$Params {
  floorObjectId: number;
      body?: UpdateFloorObjectRequestModel
}

export function floorObjectsUpdateFloorObjectPut(http: HttpClient, rootUrl: string, params: FloorObjectsUpdateFloorObjectPut$Params, context?: HttpContext): Observable<StrictHttpResponse<FloorObjectResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, floorObjectsUpdateFloorObjectPut.PATH, 'put');
  if (params) {
    rb.path('floorObjectId', params.floorObjectId, {});
    rb.body(params.body, 'application/*+json');
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

floorObjectsUpdateFloorObjectPut.PATH = '/api/table/floor-objects/{floorObjectId}';
