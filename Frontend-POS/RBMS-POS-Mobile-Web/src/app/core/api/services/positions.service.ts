/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ModuleTreeResponseModelBaseResponseModel } from '../models/module-tree-response-model-base-response-model';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';
import { PermissionMatrixResponseModelBaseResponseModel } from '../models/permission-matrix-response-model-base-response-model';
import { PositionDropdownModelListResponseModel } from '../models/position-dropdown-model-list-response-model';
import { PositionResponseModelBaseResponseModel } from '../models/position-response-model-base-response-model';
import { PositionResponseModelPaginationResult } from '../models/position-response-model-pagination-result';
import { positionsCreatePositionPost } from '../fn/positions/positions-create-position-post';
import { PositionsCreatePositionPost$Params } from '../fn/positions/positions-create-position-post';
import { positionsDeletePositionDelete } from '../fn/positions/positions-delete-position-delete';
import { PositionsDeletePositionDelete$Params } from '../fn/positions/positions-delete-position-delete';
import { positionsGetModuleTreeGet } from '../fn/positions/positions-get-module-tree-get';
import { PositionsGetModuleTreeGet$Params } from '../fn/positions/positions-get-module-tree-get';
import { positionsGetMyPermissionsGet } from '../fn/positions/positions-get-my-permissions-get';
import { PositionsGetMyPermissionsGet$Params } from '../fn/positions/positions-get-my-permissions-get';
import { positionsGetPositionByIdGet } from '../fn/positions/positions-get-position-by-id-get';
import { PositionsGetPositionByIdGet$Params } from '../fn/positions/positions-get-position-by-id-get';
import { positionsGetPositionDropdownGet } from '../fn/positions/positions-get-position-dropdown-get';
import { PositionsGetPositionDropdownGet$Params } from '../fn/positions/positions-get-position-dropdown-get';
import { positionsGetPositionPermissionsGet } from '../fn/positions/positions-get-position-permissions-get';
import { PositionsGetPositionPermissionsGet$Params } from '../fn/positions/positions-get-position-permissions-get';
import { positionsGetPositionsGet } from '../fn/positions/positions-get-positions-get';
import { PositionsGetPositionsGet$Params } from '../fn/positions/positions-get-positions-get';
import { positionsUpdatePositionPermissionsPut } from '../fn/positions/positions-update-position-permissions-put';
import { PositionsUpdatePositionPermissionsPut$Params } from '../fn/positions/positions-update-position-permissions-put';
import { positionsUpdatePositionPut } from '../fn/positions/positions-update-position-put';
import { PositionsUpdatePositionPut$Params } from '../fn/positions/positions-update-position-put';
import { StringListResponseModel } from '../models/string-list-response-model';

@Injectable({ providedIn: 'root' })
export class PositionsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `positionsGetPositionsGet()` */
  static readonly PositionsGetPositionsGetPath = '/api/admin/positions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsGetPositionsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetPositionsGet$Response(params?: PositionsGetPositionsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelPaginationResult>> {
    return positionsGetPositionsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsGetPositionsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetPositionsGet(params?: PositionsGetPositionsGet$Params, context?: HttpContext): Observable<PositionResponseModelPaginationResult> {
    return this.positionsGetPositionsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionResponseModelPaginationResult>): PositionResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `positionsCreatePositionPost()` */
  static readonly PositionsCreatePositionPostPath = '/api/admin/positions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsCreatePositionPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  positionsCreatePositionPost$Response(params?: PositionsCreatePositionPost$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelBaseResponseModel>> {
    return positionsCreatePositionPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsCreatePositionPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  positionsCreatePositionPost(params?: PositionsCreatePositionPost$Params, context?: HttpContext): Observable<PositionResponseModelBaseResponseModel> {
    return this.positionsCreatePositionPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionResponseModelBaseResponseModel>): PositionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `positionsGetPositionByIdGet()` */
  static readonly PositionsGetPositionByIdGetPath = '/api/admin/positions/{positionId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsGetPositionByIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetPositionByIdGet$Response(params: PositionsGetPositionByIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelBaseResponseModel>> {
    return positionsGetPositionByIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsGetPositionByIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetPositionByIdGet(params: PositionsGetPositionByIdGet$Params, context?: HttpContext): Observable<PositionResponseModelBaseResponseModel> {
    return this.positionsGetPositionByIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionResponseModelBaseResponseModel>): PositionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `positionsUpdatePositionPut()` */
  static readonly PositionsUpdatePositionPutPath = '/api/admin/positions/{positionId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsUpdatePositionPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  positionsUpdatePositionPut$Response(params: PositionsUpdatePositionPut$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionResponseModelBaseResponseModel>> {
    return positionsUpdatePositionPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsUpdatePositionPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  positionsUpdatePositionPut(params: PositionsUpdatePositionPut$Params, context?: HttpContext): Observable<PositionResponseModelBaseResponseModel> {
    return this.positionsUpdatePositionPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionResponseModelBaseResponseModel>): PositionResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `positionsDeletePositionDelete()` */
  static readonly PositionsDeletePositionDeletePath = '/api/admin/positions/{positionId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsDeletePositionDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsDeletePositionDelete$Response(params: PositionsDeletePositionDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return positionsDeletePositionDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsDeletePositionDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsDeletePositionDelete(params: PositionsDeletePositionDelete$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.positionsDeletePositionDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `positionsGetPositionPermissionsGet()` */
  static readonly PositionsGetPositionPermissionsGetPath = '/api/admin/positions/{positionId}/permissions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsGetPositionPermissionsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetPositionPermissionsGet$Response(params: PositionsGetPositionPermissionsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PermissionMatrixResponseModelBaseResponseModel>> {
    return positionsGetPositionPermissionsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsGetPositionPermissionsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetPositionPermissionsGet(params: PositionsGetPositionPermissionsGet$Params, context?: HttpContext): Observable<PermissionMatrixResponseModelBaseResponseModel> {
    return this.positionsGetPositionPermissionsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PermissionMatrixResponseModelBaseResponseModel>): PermissionMatrixResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `positionsUpdatePositionPermissionsPut()` */
  static readonly PositionsUpdatePositionPermissionsPutPath = '/api/admin/positions/{positionId}/permissions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsUpdatePositionPermissionsPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  positionsUpdatePositionPermissionsPut$Response(params: PositionsUpdatePositionPermissionsPut$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return positionsUpdatePositionPermissionsPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsUpdatePositionPermissionsPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  positionsUpdatePositionPermissionsPut(params: PositionsUpdatePositionPermissionsPut$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.positionsUpdatePositionPermissionsPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `positionsGetPositionDropdownGet()` */
  static readonly PositionsGetPositionDropdownGetPath = '/api/admin/positions/dropdown';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsGetPositionDropdownGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetPositionDropdownGet$Response(params?: PositionsGetPositionDropdownGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PositionDropdownModelListResponseModel>> {
    return positionsGetPositionDropdownGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsGetPositionDropdownGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetPositionDropdownGet(params?: PositionsGetPositionDropdownGet$Params, context?: HttpContext): Observable<PositionDropdownModelListResponseModel> {
    return this.positionsGetPositionDropdownGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PositionDropdownModelListResponseModel>): PositionDropdownModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `positionsGetModuleTreeGet()` */
  static readonly PositionsGetModuleTreeGetPath = '/api/admin/positions/modules/tree';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsGetModuleTreeGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetModuleTreeGet$Response(params?: PositionsGetModuleTreeGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ModuleTreeResponseModelBaseResponseModel>> {
    return positionsGetModuleTreeGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsGetModuleTreeGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetModuleTreeGet(params?: PositionsGetModuleTreeGet$Params, context?: HttpContext): Observable<ModuleTreeResponseModelBaseResponseModel> {
    return this.positionsGetModuleTreeGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ModuleTreeResponseModelBaseResponseModel>): ModuleTreeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `positionsGetMyPermissionsGet()` */
  static readonly PositionsGetMyPermissionsGetPath = '/api/admin/positions/me/permissions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `positionsGetMyPermissionsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetMyPermissionsGet$Response(params?: PositionsGetMyPermissionsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<StringListResponseModel>> {
    return positionsGetMyPermissionsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `positionsGetMyPermissionsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  positionsGetMyPermissionsGet(params?: PositionsGetMyPermissionsGet$Params, context?: HttpContext): Observable<StringListResponseModel> {
    return this.positionsGetMyPermissionsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<StringListResponseModel>): StringListResponseModel => r.body)
    );
  }

}
