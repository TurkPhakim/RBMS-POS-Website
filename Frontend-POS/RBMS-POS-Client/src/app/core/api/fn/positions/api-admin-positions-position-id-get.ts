/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { PositionResponseModelBaseResponseModel } from '../../models/position-response-model-base-response-model';

export interface ApiAdminPositionsPositionIdGet$Params {
  positionId: number;
}

export function apiAdminPositionsPositionIdGet(http: HttpClient, rootUrl: string, params: ApiAdminPositionsPositionIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminPositionsPositionIdGet.PATH, 'get');
  if (params) {
    rb.path('positionId', params.positionId, {});
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

apiAdminPositionsPositionIdGet.PATH = '/api/admin/positions/{positionId}';
