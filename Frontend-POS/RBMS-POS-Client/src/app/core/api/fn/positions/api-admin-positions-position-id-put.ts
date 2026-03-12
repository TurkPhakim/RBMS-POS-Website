/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { PositionResponseModelBaseResponseModel } from '../../models/position-response-model-base-response-model';
import { UpdatePositionRequestModel } from '../../models/update-position-request-model';

export interface ApiAdminPositionsPositionIdPut$Params {
  positionId: number;
      body?: UpdatePositionRequestModel
}

export function apiAdminPositionsPositionIdPut(http: HttpClient, rootUrl: string, params: ApiAdminPositionsPositionIdPut$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminPositionsPositionIdPut.PATH, 'put');
  if (params) {
    rb.path('positionId', params.positionId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<PositionResponseModelBaseResponseModel>;
    })
  );
}

apiAdminPositionsPositionIdPut.PATH = '/api/admin/positions/{positionId}';
