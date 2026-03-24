/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ReservationResponseModelPaginationResult } from '../../models/reservation-response-model-pagination-result';

export interface ReservationsGetReservationsGet$Params {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
}

export function reservationsGetReservationsGet(http: HttpClient, rootUrl: string, params?: ReservationsGetReservationsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReservationResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, reservationsGetReservationsGet.PATH, 'get');
  if (params) {
    rb.query('dateFrom', params.dateFrom, {});
    rb.query('dateTo', params.dateTo, {});
    rb.query('status', params.status, {});
    rb.query('Page', params.Page, {});
    rb.query('ItemPerPage', params.ItemPerPage, {});
    rb.query('Search', params.Search, {});
    rb.query('OrderBy', params.OrderBy, {});
    rb.query('IsDescending', params.IsDescending, {});
    rb.query('Skip', params.Skip, {});
    rb.query('Take', params.Take, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ReservationResponseModelPaginationResult>;
    })
  );
}

reservationsGetReservationsGet.PATH = '/api/table/reservations';
