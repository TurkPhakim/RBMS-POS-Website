/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Int32BaseResponseModel } from '../models/int-32-base-response-model';
import { NotificationResponseModelListResponseModel } from '../models/notification-response-model-list-response-model';
import { notificationsClearAllDelete } from '../fn/notifications/notifications-clear-all-delete';
import { NotificationsClearAllDelete$Params } from '../fn/notifications/notifications-clear-all-delete';
import { notificationsGetNotificationsGet } from '../fn/notifications/notifications-get-notifications-get';
import { NotificationsGetNotificationsGet$Params } from '../fn/notifications/notifications-get-notifications-get';
import { notificationsGetUnreadCountGet } from '../fn/notifications/notifications-get-unread-count-get';
import { NotificationsGetUnreadCountGet$Params } from '../fn/notifications/notifications-get-unread-count-get';
import { notificationsMarkAllReadPatch } from '../fn/notifications/notifications-mark-all-read-patch';
import { NotificationsMarkAllReadPatch$Params } from '../fn/notifications/notifications-mark-all-read-patch';
import { notificationsMarkReadPatch } from '../fn/notifications/notifications-mark-read-patch';
import { NotificationsMarkReadPatch$Params } from '../fn/notifications/notifications-mark-read-patch';
import { StringBaseResponseModel } from '../models/string-base-response-model';

@Injectable({ providedIn: 'root' })
export class NotificationsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `notificationsGetNotificationsGet()` */
  static readonly NotificationsGetNotificationsGetPath = '/api/Notifications';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationsGetNotificationsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsGetNotificationsGet$Response(params?: NotificationsGetNotificationsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<NotificationResponseModelListResponseModel>> {
    return notificationsGetNotificationsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationsGetNotificationsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsGetNotificationsGet(params?: NotificationsGetNotificationsGet$Params, context?: HttpContext): Observable<NotificationResponseModelListResponseModel> {
    return this.notificationsGetNotificationsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<NotificationResponseModelListResponseModel>): NotificationResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `notificationsGetUnreadCountGet()` */
  static readonly NotificationsGetUnreadCountGetPath = '/api/Notifications/unread-count';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationsGetUnreadCountGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsGetUnreadCountGet$Response(params?: NotificationsGetUnreadCountGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Int32BaseResponseModel>> {
    return notificationsGetUnreadCountGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationsGetUnreadCountGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsGetUnreadCountGet(params?: NotificationsGetUnreadCountGet$Params, context?: HttpContext): Observable<Int32BaseResponseModel> {
    return this.notificationsGetUnreadCountGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<Int32BaseResponseModel>): Int32BaseResponseModel => r.body)
    );
  }

  /** Path part for operation `notificationsMarkReadPatch()` */
  static readonly NotificationsMarkReadPatchPath = '/api/Notifications/{notificationId}/read';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationsMarkReadPatch()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsMarkReadPatch$Response(params: NotificationsMarkReadPatch$Params, context?: HttpContext): Observable<StrictHttpResponse<StringBaseResponseModel>> {
    return notificationsMarkReadPatch(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationsMarkReadPatch$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsMarkReadPatch(params: NotificationsMarkReadPatch$Params, context?: HttpContext): Observable<StringBaseResponseModel> {
    return this.notificationsMarkReadPatch$Response(params, context).pipe(
      map((r: StrictHttpResponse<StringBaseResponseModel>): StringBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `notificationsMarkAllReadPatch()` */
  static readonly NotificationsMarkAllReadPatchPath = '/api/Notifications/read-all';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationsMarkAllReadPatch()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsMarkAllReadPatch$Response(params?: NotificationsMarkAllReadPatch$Params, context?: HttpContext): Observable<StrictHttpResponse<StringBaseResponseModel>> {
    return notificationsMarkAllReadPatch(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationsMarkAllReadPatch$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsMarkAllReadPatch(params?: NotificationsMarkAllReadPatch$Params, context?: HttpContext): Observable<StringBaseResponseModel> {
    return this.notificationsMarkAllReadPatch$Response(params, context).pipe(
      map((r: StrictHttpResponse<StringBaseResponseModel>): StringBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `notificationsClearAllDelete()` */
  static readonly NotificationsClearAllDeletePath = '/api/Notifications/clear-all';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationsClearAllDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsClearAllDelete$Response(params?: NotificationsClearAllDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<StringBaseResponseModel>> {
    return notificationsClearAllDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationsClearAllDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationsClearAllDelete(params?: NotificationsClearAllDelete$Params, context?: HttpContext): Observable<StringBaseResponseModel> {
    return this.notificationsClearAllDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<StringBaseResponseModel>): StringBaseResponseModel => r.body)
    );
  }

}
