/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { BooleanBaseResponseModel } from '../../models/boolean-base-response-model';

export interface HumanResourceCheckDuplicateGet$Params {
  field?: string;
  value?: string;
  excludeEmployeeId?: number;
}

export function humanResourceCheckDuplicateGet(http: HttpClient, rootUrl: string, params?: HumanResourceCheckDuplicateGet$Params, context?: HttpContext): Observable<StrictHttpResponse<BooleanBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceCheckDuplicateGet.PATH, 'get');
  if (params) {
    rb.query('field', params.field, {});
    rb.query('value', params.value, {});
    rb.query('excludeEmployeeId', params.excludeEmployeeId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<BooleanBaseResponseModel>;
    })
  );
}

humanResourceCheckDuplicateGet.PATH = '/api/humanresource/check-duplicate';
