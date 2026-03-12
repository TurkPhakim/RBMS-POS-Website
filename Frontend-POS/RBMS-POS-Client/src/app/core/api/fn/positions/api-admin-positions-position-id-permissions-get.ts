/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { PermissionMatrixResponseModelBaseResponseModel } from '../../models/permission-matrix-response-model-base-response-model';

export interface ApiAdminPositionsPositionIdPermissionsGet$Params {
  positionId: number;
}

export function apiAdminPositionsPositionIdPermissionsGet(http: HttpClient, rootUrl: string, params: ApiAdminPositionsPositionIdPermissionsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PermissionMatrixResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminPositionsPositionIdPermissionsGet.PATH, 'get');
  if (params) {
    rb.path('positionId', params.positionId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<PermissionMatrixResponseModelBaseResponseModel>;
    })
  );
}

apiAdminPositionsPositionIdPermissionsGet.PATH = '/api/admin/positions/{positionId}/permissions';
