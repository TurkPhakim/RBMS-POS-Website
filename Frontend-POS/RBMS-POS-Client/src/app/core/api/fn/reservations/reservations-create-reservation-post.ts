/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateReservationRequestModel } from '../../models/create-reservation-request-model';
import { ReservationResponseModelBaseResponseModel } from '../../models/reservation-response-model-base-response-model';

export interface ReservationsCreateReservationPost$Params {
      body?: CreateReservationRequestModel
}

export function reservationsCreateReservationPost(http: HttpClient, rootUrl: string, params?: ReservationsCreateReservationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, reservationsCreateReservationPost.PATH, 'post');
  if (params) {
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

reservationsCreateReservationPost.PATH = '/api/table/reservations';
