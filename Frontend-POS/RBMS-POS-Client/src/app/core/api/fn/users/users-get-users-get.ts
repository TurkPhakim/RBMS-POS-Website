/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserListResponseModelPaginationResult } from '../../models/user-list-response-model-pagination-result';

export interface UsersGetUsersGet$Params {
  Page?: number;
  ItemPerPage?: number;
  Search?: string;
  OrderBy?: string;
  IsDescending?: boolean;
  Skip?: number;
  Take?: number;
  isActive?: boolean;
  isLocked?: boolean;
  positionId?: number;
}

export function usersGetUsersGet(http: HttpClient, rootUrl: string, params?: UsersGetUsersGet$Params, context?: HttpContext): Observable<StrictHttpResponse<UserListResponseModelPaginationResult>> {
  const rb = new RequestBuilder(rootUrl, usersGetUsersGet.PATH, 'get');
  if (params) {
    rb.query('Page', params.Page, {});
    rb.query('ItemPerPage', params.ItemPerPage, {});
    rb.query('Search', params.Search, {});
    rb.query('OrderBy', params.OrderBy, {});
    rb.query('IsDescending', params.IsDescending, {});
    rb.query('Skip', params.Skip, {});
    rb.query('Take', params.Take, {});
    rb.query('isActive', params.isActive, {});
    rb.query('isLocked', params.isLocked, {});
    rb.query('positionId', params.positionId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UserListResponseModelPaginationResult>;
    })
  );
}

usersGetUsersGet.PATH = '/api/admin/users';
