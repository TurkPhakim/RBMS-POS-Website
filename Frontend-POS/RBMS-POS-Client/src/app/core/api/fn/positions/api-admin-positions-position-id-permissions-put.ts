/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObjectBaseResponseModel } from '../../models/object-base-response-model';
import { UpdatePermissionsRequestModel } from '../../models/update-permissions-request-model';

export interface ApiAdminPositionsPositionIdPermissionsPut$Params {
  positionId: number;
      body?: UpdatePermissionsRequestModel
}

export function apiAdminPositionsPositionIdPermissionsPut(http: HttpClient, rootUrl: string, params: ApiAdminPositionsPositionIdPermissionsPut$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminPositionsPositionIdPermissionsPut.PATH, 'put');
  if (params) {
    rb.path('positionId', params.positionId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ObjectBaseResponseModel>;
    })
  );
}

apiAdminPositionsPositionIdPermissionsPut.PATH = '/api/admin/positions/{positionId}/permissions';
