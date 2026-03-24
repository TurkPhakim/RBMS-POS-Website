/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { CashierSessionResponseModelBaseResponseModel } from '../models/cashier-session-response-model-base-response-model';
import { CashierSessionResponseModelPaginationResult } from '../models/cashier-session-response-model-pagination-result';
import { cashierSessionsCashInPost } from '../fn/cashier-sessions/cashier-sessions-cash-in-post';
import { CashierSessionsCashInPost$Params } from '../fn/cashier-sessions/cashier-sessions-cash-in-post';
import { cashierSessionsCashOutPost } from '../fn/cashier-sessions/cashier-sessions-cash-out-post';
import { CashierSessionsCashOutPost$Params } from '../fn/cashier-sessions/cashier-sessions-cash-out-post';
import { cashierSessionsCloseSessionPost } from '../fn/cashier-sessions/cashier-sessions-close-session-post';
import { CashierSessionsCloseSessionPost$Params } from '../fn/cashier-sessions/cashier-sessions-close-session-post';
import { cashierSessionsGetCurrentSessionGet } from '../fn/cashier-sessions/cashier-sessions-get-current-session-get';
import { CashierSessionsGetCurrentSessionGet$Params } from '../fn/cashier-sessions/cashier-sessions-get-current-session-get';
import { cashierSessionsGetSessionByIdGet } from '../fn/cashier-sessions/cashier-sessions-get-session-by-id-get';
import { CashierSessionsGetSessionByIdGet$Params } from '../fn/cashier-sessions/cashier-sessions-get-session-by-id-get';
import { cashierSessionsGetSessionHistoryGet } from '../fn/cashier-sessions/cashier-sessions-get-session-history-get';
import { CashierSessionsGetSessionHistoryGet$Params } from '../fn/cashier-sessions/cashier-sessions-get-session-history-get';
import { cashierSessionsOpenSessionPost } from '../fn/cashier-sessions/cashier-sessions-open-session-post';
import { CashierSessionsOpenSessionPost$Params } from '../fn/cashier-sessions/cashier-sessions-open-session-post';

@Injectable({ providedIn: 'root' })
export class CashierSessionsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `cashierSessionsGetCurrentSessionGet()` */
  static readonly CashierSessionsGetCurrentSessionGetPath = '/api/cashier/sessions/current';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cashierSessionsGetCurrentSessionGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  cashierSessionsGetCurrentSessionGet$Response(params?: CashierSessionsGetCurrentSessionGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
    return cashierSessionsGetCurrentSessionGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cashierSessionsGetCurrentSessionGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  cashierSessionsGetCurrentSessionGet(params?: CashierSessionsGetCurrentSessionGet$Params, context?: HttpContext): Observable<CashierSessionResponseModelBaseResponseModel> {
    return this.cashierSessionsGetCurrentSessionGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>): CashierSessionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `cashierSessionsGetSessionHistoryGet()` */
  static readonly CashierSessionsGetSessionHistoryGetPath = '/api/cashier/sessions/history';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cashierSessionsGetSessionHistoryGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  cashierSessionsGetSessionHistoryGet$Response(params?: CashierSessionsGetSessionHistoryGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelPaginationResult>> {
    return cashierSessionsGetSessionHistoryGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cashierSessionsGetSessionHistoryGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  cashierSessionsGetSessionHistoryGet(params?: CashierSessionsGetSessionHistoryGet$Params, context?: HttpContext): Observable<CashierSessionResponseModelPaginationResult> {
    return this.cashierSessionsGetSessionHistoryGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<CashierSessionResponseModelPaginationResult>): CashierSessionResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `cashierSessionsGetSessionByIdGet()` */
  static readonly CashierSessionsGetSessionByIdGetPath = '/api/cashier/sessions/{cashierSessionId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cashierSessionsGetSessionByIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  cashierSessionsGetSessionByIdGet$Response(params: CashierSessionsGetSessionByIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
    return cashierSessionsGetSessionByIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cashierSessionsGetSessionByIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  cashierSessionsGetSessionByIdGet(params: CashierSessionsGetSessionByIdGet$Params, context?: HttpContext): Observable<CashierSessionResponseModelBaseResponseModel> {
    return this.cashierSessionsGetSessionByIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>): CashierSessionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `cashierSessionsOpenSessionPost()` */
  static readonly CashierSessionsOpenSessionPostPath = '/api/cashier/sessions/open';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cashierSessionsOpenSessionPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  cashierSessionsOpenSessionPost$Response(params?: CashierSessionsOpenSessionPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
    return cashierSessionsOpenSessionPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cashierSessionsOpenSessionPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  cashierSessionsOpenSessionPost(params?: CashierSessionsOpenSessionPost$Params, context?: HttpContext): Observable<CashierSessionResponseModelBaseResponseModel> {
    return this.cashierSessionsOpenSessionPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>): CashierSessionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `cashierSessionsCashInPost()` */
  static readonly CashierSessionsCashInPostPath = '/api/cashier/sessions/{cashierSessionId}/cash-in';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cashierSessionsCashInPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  cashierSessionsCashInPost$Response(params: CashierSessionsCashInPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
    return cashierSessionsCashInPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cashierSessionsCashInPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  cashierSessionsCashInPost(params: CashierSessionsCashInPost$Params, context?: HttpContext): Observable<CashierSessionResponseModelBaseResponseModel> {
    return this.cashierSessionsCashInPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>): CashierSessionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `cashierSessionsCashOutPost()` */
  static readonly CashierSessionsCashOutPostPath = '/api/cashier/sessions/{cashierSessionId}/cash-out';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cashierSessionsCashOutPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  cashierSessionsCashOutPost$Response(params: CashierSessionsCashOutPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
    return cashierSessionsCashOutPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cashierSessionsCashOutPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  cashierSessionsCashOutPost(params: CashierSessionsCashOutPost$Params, context?: HttpContext): Observable<CashierSessionResponseModelBaseResponseModel> {
    return this.cashierSessionsCashOutPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>): CashierSessionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `cashierSessionsCloseSessionPost()` */
  static readonly CashierSessionsCloseSessionPostPath = '/api/cashier/sessions/{cashierSessionId}/close';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cashierSessionsCloseSessionPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  cashierSessionsCloseSessionPost$Response(params: CashierSessionsCloseSessionPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>> {
    return cashierSessionsCloseSessionPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cashierSessionsCloseSessionPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  cashierSessionsCloseSessionPost(params: CashierSessionsCloseSessionPost$Params, context?: HttpContext): Observable<CashierSessionResponseModelBaseResponseModel> {
    return this.cashierSessionsCloseSessionPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<CashierSessionResponseModelBaseResponseModel>): CashierSessionResponseModelBaseResponseModel => r.body)
    );
  }

}
