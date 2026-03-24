/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateOptionGroupRequestModel } from '../../models/create-option-group-request-model';
import { OptionGroupResponseModelBaseResponseModel } from '../../models/option-group-response-model-base-response-model';

export interface MenuOptionsCreateOptionGroupPost$Params {
      body?: CreateOptionGroupRequestModel
}

export function menuOptionsCreateOptionGroupPost(http: HttpClient, rootUrl: string, params?: MenuOptionsCreateOptionGroupPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, menuOptionsCreateOptionGroupPost.PATH, 'post');
  if (params) {
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

menuOptionsCreateOptionGroupPost.PATH = '/api/menu/options';
