/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ServiceChargeResponseModelPaginationResult } from '../../models/service-charge-response-model-pagination-result';

export interface ServiceChargesGetAllGet$Params {
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
  isActive?: boolean;
}

export function serviceChargesGetAllGet(http: HttpClient, rootUrl: string, params?: ServiceChargesGetAllGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, serviceChargesGetAllGet.PATH, 'get');
  if (params) {
    rb.query('Page', params.Page, {});
    rb.query('ItemPerPage', params.ItemPerPage, {});
    rb.query('Search', params.Search, {});
    rb.query('OrderBy', params.OrderBy, {});
    rb.query('IsDescending', params.IsDescending, {});
    rb.query('Skip', params.Skip, {});
    rb.query('Take', params.Take, {});
    rb.query('isActive', params.isActive, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ServiceChargeResponseModelPaginationResult>;
    })
  );
}

serviceChargesGetAllGet.PATH = '/api/admin/servicecharges';
