/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { StringBaseResponseModel } from '../../models/string-base-response-model';

export interface NotificationsMarkReadPatch$Params {
  notificationId: number;
}

export function notificationsMarkReadPatch(http: HttpClient, rootUrl: string, params: NotificationsMarkReadPatch$Params, context?: HttpContext): Observable<StrictHttpResponse<StringBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, notificationsMarkReadPatch.PATH, 'patch');
  if (params) {
    rb.path('notificationId', params.notificationId, {});
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

notificationsMarkReadPatch.PATH = '/api/Notifications/{notificationId}/read';
