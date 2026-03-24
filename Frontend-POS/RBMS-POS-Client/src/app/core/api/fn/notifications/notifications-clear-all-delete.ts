/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { StringBaseResponseModel } from '../../models/string-base-response-model';

export interface NotificationsClearAllDelete$Params {
}

export function notificationsClearAllDelete(http: HttpClient, rootUrl: string, params?: NotificationsClearAllDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<StringBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, notificationsClearAllDelete.PATH, 'delete');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<StringBaseResponseModel>;
    })
  );
}

notificationsClearAllDelete.PATH = '/api/Notifications/clear-all';
