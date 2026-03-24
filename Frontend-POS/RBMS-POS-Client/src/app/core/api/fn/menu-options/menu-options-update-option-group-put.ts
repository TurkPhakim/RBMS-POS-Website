/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OptionGroupResponseModelBaseResponseModel } from '../../models/option-group-response-model-base-response-model';
import { UpdateOptionGroupRequestModel } from '../../models/update-option-group-request-model';

export interface MenuOptionsUpdateOptionGroupPut$Params {
  optionGroupId: number;
      body?: UpdateOptionGroupRequestModel
}

export function menuOptionsUpdateOptionGroupPut(http: HttpClient, rootUrl: string, params: MenuOptionsUpdateOptionGroupPut$Params, context?: HttpContext): Observable<StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, menuOptionsUpdateOptionGroupPut.PATH, 'put');
  if (params) {
    rb.path('optionGroupId', params.optionGroupId, {});
    rb.body(params.body, 'application/*+json');
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

menuOptionsUpdateOptionGroupPut.PATH = '/api/menu/options/{optionGroupId}';
