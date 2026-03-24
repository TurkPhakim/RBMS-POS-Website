/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ConfirmReservationRequestModel } from '../../models/confirm-reservation-request-model';
import { ReservationResponseModelBaseResponseModel } from '../../models/reservation-response-model-base-response-model';

export interface ReservationsConfirmReservationPost$Params {
  reservationId: number;
      body?: ConfirmReservationRequestModel
}

export function reservationsConfirmReservationPost(http: HttpClient, rootUrl: string, params: ReservationsConfirmReservationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, reservationsConfirmReservationPost.PATH, 'post');
  if (params) {
    rb.path('reservationId', params.reservationId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ReservationResponseModelBaseResponseModel>;
    })
  );
}

reservationsConfirmReservationPost.PATH = '/api/table/reservations/{reservationId}/confirm';
