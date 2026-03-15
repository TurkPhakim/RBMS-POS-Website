/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmployeeResponseModelPaginationResult } from '../../models/employee-response-model-pagination-result';

export interface HumanResourceGetEmployeesGet$Params {
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
  isActive?: boolean;
  positionId?: number;
}

export function humanResourceGetEmployeesGet(http: HttpClient, rootUrl: string, params?: HumanResourceGetEmployeesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, humanResourceGetEmployeesGet.PATH, 'get');
  if (params) {
    rb.query('Page', params.Page, {});
    rb.query('ItemPerPage', params.ItemPerPage, {});
    rb.query('Search', params.Search, {});
    rb.query('OrderBy', params.OrderBy, {});
    rb.query('IsDescending', params.IsDescending, {});
    rb.query('Skip', params.Skip, {});
    rb.query('Take', params.Take, {});
    rb.query('isActive', params.isActive, {});
    rb.query('positionId', params.positionId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<EmployeeResponseModelPaginationResult>;
    })
  );
}

humanResourceGetEmployeesGet.PATH = '/api/humanresource';
