/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateFloorObjectRequestModel } from '../../models/create-floor-object-request-model';
import { FloorObjectResponseModelBaseResponseModel } from '../../models/floor-object-response-model-base-response-model';

export interface FloorObjectsCreateFloorObjectPost$Params {
      body?: CreateFloorObjectRequestModel
}

export function floorObjectsCreateFloorObjectPost(http: HttpClient, rootUrl: string, params?: FloorObjectsCreateFloorObjectPost$Params, context?: HttpContext): Observable<StrictHttpResponse<FloorObjectResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, floorObjectsCreateFloorObjectPost.PATH, 'post');
  if (params) {
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

floorObjectsCreateFloorObjectPost.PATH = '/api/table/floor-objects';
