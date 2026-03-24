/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ReservationResponseModelBaseResponseModel } from '../../models/reservation-response-model-base-response-model';
import { UpdateReservationRequestModel } from '../../models/update-reservation-request-model';

export interface ReservationsUpdateReservationPut$Params {
  reservationId: number;
      body?: UpdateReservationRequestModel
}

export function reservationsUpdateReservationPut(http: HttpClient, rootUrl: string, params: ReservationsUpdateReservationPut$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, reservationsUpdateReservationPut.PATH, 'put');
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

reservationsUpdateReservationPut.PATH = '/api/table/reservations/{reservationId}';
