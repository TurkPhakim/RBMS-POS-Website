/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ModuleTreeResponseModelBaseResponseModel } from '../../models/module-tree-response-model-base-response-model';

export interface ApiAdminPositionsModulesTreeGet$Params {
}

export function apiAdminPositionsModulesTreeGet(http: HttpClient, rootUrl: string, params?: ApiAdminPositionsModulesTreeGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ModuleTreeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminPositionsModulesTreeGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ModuleTreeResponseModelBaseResponseModel>;
    })
  );
}

apiAdminPositionsModulesTreeGet.PATH = '/api/admin/positions/modules/tree';
