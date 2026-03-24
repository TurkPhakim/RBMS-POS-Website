/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OptionGroupResponseModelBaseResponseModel } from '../../models/option-group-response-model-base-response-model';

export interface MenuOptionsGetOptionGroupGet$Params {
  optionGroupId: number;
}

export function menuOptionsGetOptionGroupGet(http: HttpClient, rootUrl: string, params: MenuOptionsGetOptionGroupGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, menuOptionsGetOptionGroupGet.PATH, 'get');
  if (params) {
    rb.path('optionGroupId', params.optionGroupId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>;
    })
  );
}

menuOptionsGetOptionGroupGet.PATH = '/api/menu/options/{optionGroupId}';
