/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { apiAdminPositionsDropdownGet } from '../fn/positions/api-admin-positions-dropdown-get';
import { ApiAdminPositionsDropdownGet$Params } from '../fn/positions/api-admin-positions-dropdown-get';
import { apiAdminPositionsGet } from '../fn/positions/api-admin-positions-get';
import { ApiAdminPositionsGet$Params } from '../fn/positions/api-admin-positions-get';
import { apiAdminPositionsMePermissionsGet } from '../fn/positions/api-admin-positions-me-permissions-get';
import { ApiAdminPositionsMePermissionsGet$Params } from '../fn/positions/api-admin-positions-me-permissions-get';
import { apiAdminPositionsModulesTreeGet } from '../fn/positions/api-admin-positions-modules-tree-get';
import { ApiAdminPositionsModulesTreeGet$Params } from '../fn/positions/api-admin-positions-modules-tree-get';
import { apiAdminPositionsPositionIdDelete } from '../fn/positions/api-admin-positions-position-id-delete';
import { ApiAdminPositionsPositionIdDelete$Params } from '../fn/positions/api-admin-positions-position-id-delete';
import { apiAdminPositionsPositionIdGet } from '../fn/positions/api-admin-positions-position-id-get';
import { ApiAdminPositionsPositionIdGet$Params } from '../fn/positions/api-admin-positions-position-id-get';
import { apiAdminPositionsPositionIdPermissionsGet } from '../fn/positions/api-admin-positions-position-id-permissions-get';
import { ApiAdminPositionsPositionIdPermissionsGet$Params } from '../fn/positions/api-admin-positions-position-id-permissions-get';
import { apiAdminPositionsPositionIdPermissionsPut } from '../fn/positions/api-admin-positions-position-id-permissions-put';
import { ApiAdminPositionsPositionIdPermissionsPut$Params } from '../fn/positions/api-admin-positions-position-id-permissions-put';
import { apiAdminPositionsPositionIdPut } from '../fn/positions/api-admin-positions-position-id-put';
import { ApiAdminPositionsPositionIdPut$Params } from '../fn/positions/api-admin-positions-position-id-put';
import { apiAdminPositionsPost } from '../fn/positions/api-admin-positions-post';
import { ApiAdminPositionsPost$Params } from '../fn/positions/api-admin-positions-post';
import { ModuleTreeResponseModelBaseResponseModel } from '../models/module-tree-response-model-base-response-model';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';
import { PermissionMatrixResponseModelBaseResponseModel } from '../models/permission-matrix-response-model-base-response-model';
import { PositionDropdownModelListResponseModel } from '../models/position-dropdown-model-list-response-model';
import { PositionResponseModelBaseResponseModel } from '../models/position-response-model-base-response-model';
import { PositionResponseModelPaginationResult } from '../models/position-response-model-pagination-result';
import { StringListResponseModel } from '../models/string-list-response-model';

@Injectable({ providedIn: 'root' })
export class PositionsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `apiAdminPositionsGet()` */
  static readonly ApiAdminPositionsGetPath = '/api/admin/positions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsGet$Response(params?: ApiAdminPositionsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelPaginationResult>> {
    return apiAdminPositionsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsGet(params?: ApiAdminPositionsGet$Params, context?: HttpContext): Observable<PositionResponseModelPaginationResult> {
    return this.apiAdminPositionsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionResponseModelPaginationResult>): PositionResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `apiAdminPositionsPost()` */
  static readonly ApiAdminPositionsPostPath = '/api/admin/positions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminPositionsPost$Response(params?: ApiAdminPositionsPost$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelBaseResponseModel>> {
    return apiAdminPositionsPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminPositionsPost(params?: ApiAdminPositionsPost$Params, context?: HttpContext): Observable<PositionResponseModelBaseResponseModel> {
    return this.apiAdminPositionsPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionResponseModelBaseResponseModel>): PositionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminPositionsPositionIdGet()` */
  static readonly ApiAdminPositionsPositionIdGetPath = '/api/admin/positions/{positionId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsPositionIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsPositionIdGet$Response(params: ApiAdminPositionsPositionIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelBaseResponseModel>> {
    return apiAdminPositionsPositionIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsPositionIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsPositionIdGet(params: ApiAdminPositionsPositionIdGet$Params, context?: HttpContext): Observable<PositionResponseModelBaseResponseModel> {
    return this.apiAdminPositionsPositionIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionResponseModelBaseResponseModel>): PositionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminPositionsPositionIdPut()` */
  static readonly ApiAdminPositionsPositionIdPutPath = '/api/admin/positions/{positionId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsPositionIdPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminPositionsPositionIdPut$Response(params: ApiAdminPositionsPositionIdPut$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelBaseResponseModel>> {
    return apiAdminPositionsPositionIdPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsPositionIdPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminPositionsPositionIdPut(params: ApiAdminPositionsPositionIdPut$Params, context?: HttpContext): Observable<PositionResponseModelBaseResponseModel> {
    return this.apiAdminPositionsPositionIdPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionResponseModelBaseResponseModel>): PositionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminPositionsPositionIdDelete()` */
  static readonly ApiAdminPositionsPositionIdDeletePath = '/api/admin/positions/{positionId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsPositionIdDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsPositionIdDelete$Response(params: ApiAdminPositionsPositionIdDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return apiAdminPositionsPositionIdDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsPositionIdDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsPositionIdDelete(params: ApiAdminPositionsPositionIdDelete$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.apiAdminPositionsPositionIdDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminPositionsPositionIdPermissionsGet()` */
  static readonly ApiAdminPositionsPositionIdPermissionsGetPath = '/api/admin/positions/{positionId}/permissions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsPositionIdPermissionsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsPositionIdPermissionsGet$Response(params: ApiAdminPositionsPositionIdPermissionsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PermissionMatrixResponseModelBaseResponseModel>> {
    return apiAdminPositionsPositionIdPermissionsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsPositionIdPermissionsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsPositionIdPermissionsGet(params: ApiAdminPositionsPositionIdPermissionsGet$Params, context?: HttpContext): Observable<PermissionMatrixResponseModelBaseResponseModel> {
    return this.apiAdminPositionsPositionIdPermissionsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PermissionMatrixResponseModelBaseResponseModel>): PermissionMatrixResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminPositionsPositionIdPermissionsPut()` */
  static readonly ApiAdminPositionsPositionIdPermissionsPutPath = '/api/admin/positions/{positionId}/permissions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsPositionIdPermissionsPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminPositionsPositionIdPermissionsPut$Response(params: ApiAdminPositionsPositionIdPermissionsPut$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return apiAdminPositionsPositionIdPermissionsPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsPositionIdPermissionsPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminPositionsPositionIdPermissionsPut(params: ApiAdminPositionsPositionIdPermissionsPut$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.apiAdminPositionsPositionIdPermissionsPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminPositionsDropdownGet()` */
  static readonly ApiAdminPositionsDropdownGetPath = '/api/admin/positions/dropdown';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsDropdownGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsDropdownGet$Response(params?: ApiAdminPositionsDropdownGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionDropdownModelListResponseModel>> {
    return apiAdminPositionsDropdownGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsDropdownGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsDropdownGet(params?: ApiAdminPositionsDropdownGet$Params, context?: HttpContext): Observable<PositionDropdownModelListResponseModel> {
    return this.apiAdminPositionsDropdownGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionDropdownModelListResponseModel>): PositionDropdownModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminPositionsModulesTreeGet()` */
  static readonly ApiAdminPositionsModulesTreeGetPath = '/api/admin/positions/modules/tree';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsModulesTreeGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsModulesTreeGet$Response(params?: ApiAdminPositionsModulesTreeGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ModuleTreeResponseModelBaseResponseModel>> {
    return apiAdminPositionsModulesTreeGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsModulesTreeGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsModulesTreeGet(params?: ApiAdminPositionsModulesTreeGet$Params, context?: HttpContext): Observable<ModuleTreeResponseModelBaseResponseModel> {
    return this.apiAdminPositionsModulesTreeGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ModuleTreeResponseModelBaseResponseModel>): ModuleTreeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminPositionsMePermissionsGet()` */
  static readonly ApiAdminPositionsMePermissionsGetPath = '/api/admin/positions/me/permissions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminPositionsMePermissionsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsMePermissionsGet$Response(params?: ApiAdminPositionsMePermissionsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<StringListResponseModel>> {
    return apiAdminPositionsMePermissionsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminPositionsMePermissionsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminPositionsMePermissionsGet(params?: ApiAdminPositionsMePermissionsGet$Params, context?: HttpContext): Observable<StringListResponseModel> {
    return this.apiAdminPositionsMePermissionsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<StringListResponseModel>): StringListResponseModel => r.body)
    );
  }

}
