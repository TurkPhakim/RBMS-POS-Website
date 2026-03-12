/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { StringListResponseModel } from '../../models/string-list-response-model';

export interface ApiAdminPositionsMePermissionsGet$Params {
}

export function apiAdminPositionsMePermissionsGet(http: HttpClient, rootUrl: string, params?: ApiAdminPositionsMePermissionsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<StringListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminPositionsMePermissionsGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<StringListResponseModel>;
    })
  );
}

apiAdminPositionsMePermissionsGet.PATH = '/api/admin/positions/me/permissions';
