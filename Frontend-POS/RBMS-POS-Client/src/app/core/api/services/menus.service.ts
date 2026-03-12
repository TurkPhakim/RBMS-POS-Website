/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { apiMenuAvailableGet } from '../fn/menus/api-menu-available-get';
import { ApiMenuAvailableGet$Params } from '../fn/menus/api-menu-available-get';
import { apiMenuCategoryCategoryGet } from '../fn/menus/api-menu-category-category-get';
import { ApiMenuCategoryCategoryGet$Params } from '../fn/menus/api-menu-category-category-get';
import { apiMenuGet } from '../fn/menus/api-menu-get';
import { ApiMenuGet$Params } from '../fn/menus/api-menu-get';
import { apiMenuMenuIdDelete } from '../fn/menus/api-menu-menu-id-delete';
import { ApiMenuMenuIdDelete$Params } from '../fn/menus/api-menu-menu-id-delete';
import { apiMenuMenuIdGet } from '../fn/menus/api-menu-menu-id-get';
import { ApiMenuMenuIdGet$Params } from '../fn/menus/api-menu-menu-id-get';
import { apiMenuMenuIdPut } from '../fn/menus/api-menu-menu-id-put';
import { ApiMenuMenuIdPut$Params } from '../fn/menus/api-menu-menu-id-put';
import { apiMenuPost } from '../fn/menus/api-menu-post';
import { ApiMenuPost$Params } from '../fn/menus/api-menu-post';
import { apiMenuSearchGet } from '../fn/menus/api-menu-search-get';
import { ApiMenuSearchGet$Params } from '../fn/menus/api-menu-search-get';
import { MenuResponseModelBaseResponseModel } from '../models/menu-response-model-base-response-model';
import { MenuResponseModelListResponseModel } from '../models/menu-response-model-list-response-model';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';

@Injectable({ providedIn: 'root' })
export class MenusService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `apiMenuGet()` */
  static readonly ApiMenuGetPath = '/api/menu';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiMenuGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuGet$Response(params?: ApiMenuGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
    return apiMenuGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiMenuGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuGet(params?: ApiMenuGet$Params, context?: HttpContext): Observable<MenuResponseModelListResponseModel> {
    return this.apiMenuGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelListResponseModel>): MenuResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `apiMenuPost()` */
  static readonly ApiMenuPostPath = '/api/menu';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiMenuPost()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  apiMenuPost$Response(params?: ApiMenuPost$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
    return apiMenuPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiMenuPost$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  apiMenuPost(params?: ApiMenuPost$Params, context?: HttpContext): Observable<MenuResponseModelBaseResponseModel> {
    return this.apiMenuPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelBaseResponseModel>): MenuResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiMenuMenuIdGet()` */
  static readonly ApiMenuMenuIdGetPath = '/api/menu/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiMenuMenuIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuMenuIdGet$Response(params: ApiMenuMenuIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
    return apiMenuMenuIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiMenuMenuIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuMenuIdGet(params: ApiMenuMenuIdGet$Params, context?: HttpContext): Observable<MenuResponseModelBaseResponseModel> {
    return this.apiMenuMenuIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelBaseResponseModel>): MenuResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiMenuMenuIdPut()` */
  static readonly ApiMenuMenuIdPutPath = '/api/menu/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiMenuMenuIdPut()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  apiMenuMenuIdPut$Response(params: ApiMenuMenuIdPut$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
    return apiMenuMenuIdPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiMenuMenuIdPut$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  apiMenuMenuIdPut(params: ApiMenuMenuIdPut$Params, context?: HttpContext): Observable<MenuResponseModelBaseResponseModel> {
    return this.apiMenuMenuIdPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelBaseResponseModel>): MenuResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiMenuMenuIdDelete()` */
  static readonly ApiMenuMenuIdDeletePath = '/api/menu/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiMenuMenuIdDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuMenuIdDelete$Response(params: ApiMenuMenuIdDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return apiMenuMenuIdDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiMenuMenuIdDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuMenuIdDelete(params: ApiMenuMenuIdDelete$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.apiMenuMenuIdDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiMenuCategoryCategoryGet()` */
  static readonly ApiMenuCategoryCategoryGetPath = '/api/menu/category/{category}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiMenuCategoryCategoryGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuCategoryCategoryGet$Response(params: ApiMenuCategoryCategoryGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
    return apiMenuCategoryCategoryGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiMenuCategoryCategoryGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuCategoryCategoryGet(params: ApiMenuCategoryCategoryGet$Params, context?: HttpContext): Observable<MenuResponseModelListResponseModel> {
    return this.apiMenuCategoryCategoryGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelListResponseModel>): MenuResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `apiMenuAvailableGet()` */
  static readonly ApiMenuAvailableGetPath = '/api/menu/available';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiMenuAvailableGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuAvailableGet$Response(params?: ApiMenuAvailableGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
    return apiMenuAvailableGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiMenuAvailableGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuAvailableGet(params?: ApiMenuAvailableGet$Params, context?: HttpContext): Observable<MenuResponseModelListResponseModel> {
    return this.apiMenuAvailableGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelListResponseModel>): MenuResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `apiMenuSearchGet()` */
  static readonly ApiMenuSearchGetPath = '/api/menu/search';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiMenuSearchGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuSearchGet$Response(params?: ApiMenuSearchGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
    return apiMenuSearchGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiMenuSearchGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiMenuSearchGet(params?: ApiMenuSearchGet$Params, context?: HttpContext): Observable<MenuResponseModelListResponseModel> {
    return this.apiMenuSearchGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelListResponseModel>): MenuResponseModelListResponseModel => r.body)
    );
  }

}
