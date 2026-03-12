/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreatePositionRequestModel } from '../../models/create-position-request-model';
import { PositionResponseModelBaseResponseModel } from '../../models/position-response-model-base-response-model';

export interface ApiAdminPositionsPost$Params {
      body?: CreatePositionRequestModel
}

export function apiAdminPositionsPost(http: HttpClient, rootUrl: string, params?: ApiAdminPositionsPost$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiAdminPositionsPost.PATH, 'post');
  if (params) {
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

apiAdminPositionsPost.PATH = '/api/admin/positions';
