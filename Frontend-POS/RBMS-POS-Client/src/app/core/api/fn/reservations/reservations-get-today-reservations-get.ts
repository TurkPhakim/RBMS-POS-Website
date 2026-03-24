/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ReservationResponseModelListResponseModel } from '../../models/reservation-response-model-list-response-model';

export interface ReservationsGetTodayReservationsGet$Params {
}

export function reservationsGetTodayReservationsGet(http: HttpClient, rootUrl: string, params?: ReservationsGetTodayReservationsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, reservationsGetTodayReservationsGet.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ReservationResponseModelListResponseModel>;
    })
  );
}

reservationsGetTodayReservationsGet.PATH = '/api/table/reservations/today';
