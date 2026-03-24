/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ReservationResponseModelBaseResponseModel } from '../models/reservation-response-model-base-response-model';
import { ReservationResponseModelListResponseModel } from '../models/reservation-response-model-list-response-model';
import { ReservationResponseModelPaginationResult } from '../models/reservation-response-model-pagination-result';
import { reservationsCancelReservationPost } from '../fn/reservations/reservations-cancel-reservation-post';
import { ReservationsCancelReservationPost$Params } from '../fn/reservations/reservations-cancel-reservation-post';
import { reservationsCheckInReservationPost } from '../fn/reservations/reservations-check-in-reservation-post';
import { ReservationsCheckInReservationPost$Params } from '../fn/reservations/reservations-check-in-reservation-post';
import { reservationsConfirmReservationPost } from '../fn/reservations/reservations-confirm-reservation-post';
import { ReservationsConfirmReservationPost$Params } from '../fn/reservations/reservations-confirm-reservation-post';
import { reservationsCreateReservationPost } from '../fn/reservations/reservations-create-reservation-post';
import { ReservationsCreateReservationPost$Params } from '../fn/reservations/reservations-create-reservation-post';
import { reservationsGetReservationGet } from '../fn/reservations/reservations-get-reservation-get';
import { ReservationsGetReservationGet$Params } from '../fn/reservations/reservations-get-reservation-get';
import { reservationsGetReservationsGet } from '../fn/reservations/reservations-get-reservations-get';
import { ReservationsGetReservationsGet$Params } from '../fn/reservations/reservations-get-reservations-get';
import { reservationsGetTodayReservationsGet } from '../fn/reservations/reservations-get-today-reservations-get';
import { ReservationsGetTodayReservationsGet$Params } from '../fn/reservations/reservations-get-today-reservations-get';
import { reservationsNoShowReservationPost } from '../fn/reservations/reservations-no-show-reservation-post';
import { ReservationsNoShowReservationPost$Params } from '../fn/reservations/reservations-no-show-reservation-post';
import { reservationsUpdateReservationPut } from '../fn/reservations/reservations-update-reservation-put';
import { ReservationsUpdateReservationPut$Params } from '../fn/reservations/reservations-update-reservation-put';

@Injectable({ providedIn: 'root' })
export class ReservationsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `reservationsGetReservationsGet()` */
  static readonly ReservationsGetReservationsGetPath = '/api/table/reservations';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reservationsGetReservationsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsGetReservationsGet$Response(params?: ReservationsGetReservationsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelPaginationResult>> {
    return reservationsGetReservationsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reservationsGetReservationsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsGetReservationsGet(params?: ReservationsGetReservationsGet$Params, context?: HttpContext): Observable<ReservationResponseModelPaginationResult> {
    return this.reservationsGetReservationsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReservationResponseModelPaginationResult>): ReservationResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `reservationsCreateReservationPost()` */
  static readonly ReservationsCreateReservationPostPath = '/api/table/reservations';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reservationsCreateReservationPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  reservationsCreateReservationPost$Response(params?: ReservationsCreateReservationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
    return reservationsCreateReservationPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reservationsCreateReservationPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  reservationsCreateReservationPost(params?: ReservationsCreateReservationPost$Params, context?: HttpContext): Observable<ReservationResponseModelBaseResponseModel> {
    return this.reservationsCreateReservationPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReservationResponseModelBaseResponseModel>): ReservationResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `reservationsGetTodayReservationsGet()` */
  static readonly ReservationsGetTodayReservationsGetPath = '/api/table/reservations/today';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reservationsGetTodayReservationsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsGetTodayReservationsGet$Response(params?: ReservationsGetTodayReservationsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelListResponseModel>> {
    return reservationsGetTodayReservationsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reservationsGetTodayReservationsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsGetTodayReservationsGet(params?: ReservationsGetTodayReservationsGet$Params, context?: HttpContext): Observable<ReservationResponseModelListResponseModel> {
    return this.reservationsGetTodayReservationsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReservationResponseModelListResponseModel>): ReservationResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `reservationsGetReservationGet()` */
  static readonly ReservationsGetReservationGetPath = '/api/table/reservations/{reservationId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reservationsGetReservationGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsGetReservationGet$Response(params: ReservationsGetReservationGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
    return reservationsGetReservationGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reservationsGetReservationGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsGetReservationGet(params: ReservationsGetReservationGet$Params, context?: HttpContext): Observable<ReservationResponseModelBaseResponseModel> {
    return this.reservationsGetReservationGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReservationResponseModelBaseResponseModel>): ReservationResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `reservationsUpdateReservationPut()` */
  static readonly ReservationsUpdateReservationPutPath = '/api/table/reservations/{reservationId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reservationsUpdateReservationPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  reservationsUpdateReservationPut$Response(params: ReservationsUpdateReservationPut$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
    return reservationsUpdateReservationPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reservationsUpdateReservationPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  reservationsUpdateReservationPut(params: ReservationsUpdateReservationPut$Params, context?: HttpContext): Observable<ReservationResponseModelBaseResponseModel> {
    return this.reservationsUpdateReservationPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReservationResponseModelBaseResponseModel>): ReservationResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `reservationsConfirmReservationPost()` */
  static readonly ReservationsConfirmReservationPostPath = '/api/table/reservations/{reservationId}/confirm';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reservationsConfirmReservationPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  reservationsConfirmReservationPost$Response(params: ReservationsConfirmReservationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
    return reservationsConfirmReservationPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reservationsConfirmReservationPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  reservationsConfirmReservationPost(params: ReservationsConfirmReservationPost$Params, context?: HttpContext): Observable<ReservationResponseModelBaseResponseModel> {
    return this.reservationsConfirmReservationPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReservationResponseModelBaseResponseModel>): ReservationResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `reservationsCheckInReservationPost()` */
  static readonly ReservationsCheckInReservationPostPath = '/api/table/reservations/{reservationId}/check-in';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reservationsCheckInReservationPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsCheckInReservationPost$Response(params: ReservationsCheckInReservationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
    return reservationsCheckInReservationPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reservationsCheckInReservationPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsCheckInReservationPost(params: ReservationsCheckInReservationPost$Params, context?: HttpContext): Observable<ReservationResponseModelBaseResponseModel> {
    return this.reservationsCheckInReservationPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReservationResponseModelBaseResponseModel>): ReservationResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `reservationsCancelReservationPost()` */
  static readonly ReservationsCancelReservationPostPath = '/api/table/reservations/{reservationId}/cancel';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reservationsCancelReservationPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsCancelReservationPost$Response(params: ReservationsCancelReservationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
    return reservationsCancelReservationPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reservationsCancelReservationPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsCancelReservationPost(params: ReservationsCancelReservationPost$Params, context?: HttpContext): Observable<ReservationResponseModelBaseResponseModel> {
    return this.reservationsCancelReservationPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReservationResponseModelBaseResponseModel>): ReservationResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `reservationsNoShowReservationPost()` */
  static readonly ReservationsNoShowReservationPostPath = '/api/table/reservations/{reservationId}/no-show';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reservationsNoShowReservationPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsNoShowReservationPost$Response(params: ReservationsNoShowReservationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
    return reservationsNoShowReservationPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reservationsNoShowReservationPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  reservationsNoShowReservationPost(params: ReservationsNoShowReservationPost$Params, context?: HttpContext): Observable<ReservationResponseModelBaseResponseModel> {
    return this.reservationsNoShowReservationPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReservationResponseModelBaseResponseModel>): ReservationResponseModelBaseResponseModel => r.body)
    );
  }

}
