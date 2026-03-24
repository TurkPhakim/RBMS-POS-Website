/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ReservationResponseModelBaseResponseModel } from '../../models/reservation-response-model-base-response-model';

export interface ReservationsCancelReservationPost$Params {
  reservationId: number;
}

export function reservationsCancelReservationPost(http: HttpClient, rootUrl: string, params: ReservationsCancelReservationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, reservationsCancelReservationPost.PATH, 'post');
  if (params) {
    rb.path('reservationId', params.reservationId, {});
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

reservationsCancelReservationPost.PATH = '/api/table/reservations/{reservationId}/cancel';
