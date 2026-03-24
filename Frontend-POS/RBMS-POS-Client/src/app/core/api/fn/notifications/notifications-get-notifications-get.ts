/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { NotificationResponseModelListResponseModel } from '../../models/notification-response-model-list-response-model';

export interface NotificationsGetNotificationsGet$Params {
  eventType?: string;
  tableId?: number;
  limit?: number;
  before?: number;
}

export function notificationsGetNotificationsGet(http: HttpClient, rootUrl: string, params?: NotificationsGetNotificationsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<NotificationResponseModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, notificationsGetNotificationsGet.PATH, 'get');
  if (params) {
    rb.query('eventType', params.eventType, {});
    rb.query('tableId', params.tableId, {});
    rb.query('limit', params.limit, {});
    rb.query('before', params.before, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<NotificationResponseModelListResponseModel>;
    })
  );
}

notificationsGetNotificationsGet.PATH = '/api/Notifications';
