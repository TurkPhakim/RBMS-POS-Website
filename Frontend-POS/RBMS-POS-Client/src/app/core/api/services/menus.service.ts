/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { MenuResponseModelBaseResponseModel } from '../models/menu-response-model-base-response-model';
import { MenuResponseModelListResponseModel } from '../models/menu-response-model-list-response-model';
import { menusCreatePost } from '../fn/menus/menus-create-post';
import { MenusCreatePost$Params } from '../fn/menus/menus-create-post';
import { menusDeleteDelete } from '../fn/menus/menus-delete-delete';
import { MenusDeleteDelete$Params } from '../fn/menus/menus-delete-delete';
import { menusGetAllGet } from '../fn/menus/menus-get-all-get';
import { MenusGetAllGet$Params } from '../fn/menus/menus-get-all-get';
import { menusGetAvailableGet } from '../fn/menus/menus-get-available-get';
import { MenusGetAvailableGet$Params } from '../fn/menus/menus-get-available-get';
import { menusGetByCategoryGet } from '../fn/menus/menus-get-by-category-get';
import { MenusGetByCategoryGet$Params } from '../fn/menus/menus-get-by-category-get';
import { menusGetByIdGet } from '../fn/menus/menus-get-by-id-get';
import { MenusGetByIdGet$Params } from '../fn/menus/menus-get-by-id-get';
import { menusSearchGet } from '../fn/menus/menus-search-get';
import { MenusSearchGet$Params } from '../fn/menus/menus-search-get';
import { menusUpdatePut } from '../fn/menus/menus-update-put';
import { MenusUpdatePut$Params } from '../fn/menus/menus-update-put';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';

@Injectable({ providedIn: 'root' })
export class MenusService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `menusGetAllGet()` */
  static readonly MenusGetAllGetPath = '/api/menu';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menusGetAllGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusGetAllGet$Response(params?: MenusGetAllGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
    return menusGetAllGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menusGetAllGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusGetAllGet(params?: MenusGetAllGet$Params, context?: HttpContext): Observable<MenuResponseModelListResponseModel> {
    return this.menusGetAllGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelListResponseModel>): MenuResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `menusCreatePost()` */
  static readonly MenusCreatePostPath = '/api/menu';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menusCreatePost()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  menusCreatePost$Response(params?: MenusCreatePost$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
    return menusCreatePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menusCreatePost$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  menusCreatePost(params?: MenusCreatePost$Params, context?: HttpContext): Observable<MenuResponseModelBaseResponseModel> {
    return this.menusCreatePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelBaseResponseModel>): MenuResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menusGetByIdGet()` */
  static readonly MenusGetByIdGetPath = '/api/menu/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menusGetByIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusGetByIdGet$Response(params: MenusGetByIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
    return menusGetByIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menusGetByIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusGetByIdGet(params: MenusGetByIdGet$Params, context?: HttpContext): Observable<MenuResponseModelBaseResponseModel> {
    return this.menusGetByIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelBaseResponseModel>): MenuResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menusUpdatePut()` */
  static readonly MenusUpdatePutPath = '/api/menu/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menusUpdatePut()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  menusUpdatePut$Response(params: MenusUpdatePut$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
    return menusUpdatePut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menusUpdatePut$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  menusUpdatePut(params: MenusUpdatePut$Params, context?: HttpContext): Observable<MenuResponseModelBaseResponseModel> {
    return this.menusUpdatePut$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelBaseResponseModel>): MenuResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menusDeleteDelete()` */
  static readonly MenusDeleteDeletePath = '/api/menu/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menusDeleteDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusDeleteDelete$Response(params: MenusDeleteDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return menusDeleteDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menusDeleteDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusDeleteDelete(params: MenusDeleteDelete$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.menusDeleteDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menusGetByCategoryGet()` */
  static readonly MenusGetByCategoryGetPath = '/api/menu/category/{category}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menusGetByCategoryGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusGetByCategoryGet$Response(params: MenusGetByCategoryGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
    return menusGetByCategoryGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menusGetByCategoryGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusGetByCategoryGet(params: MenusGetByCategoryGet$Params, context?: HttpContext): Observable<MenuResponseModelListResponseModel> {
    return this.menusGetByCategoryGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelListResponseModel>): MenuResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `menusGetAvailableGet()` */
  static readonly MenusGetAvailableGetPath = '/api/menu/available';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menusGetAvailableGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusGetAvailableGet$Response(params?: MenusGetAvailableGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
    return menusGetAvailableGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menusGetAvailableGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusGetAvailableGet(params?: MenusGetAvailableGet$Params, context?: HttpContext): Observable<MenuResponseModelListResponseModel> {
    return this.menusGetAvailableGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelListResponseModel>): MenuResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `menusSearchGet()` */
  static readonly MenusSearchGetPath = '/api/menu/search';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menusSearchGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusSearchGet$Response(params?: MenusSearchGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelListResponseModel>> {
    return menusSearchGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menusSearchGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menusSearchGet(params?: MenusSearchGet$Params, context?: HttpContext): Observable<MenuResponseModelListResponseModel> {
    return this.menusSearchGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelListResponseModel>): MenuResponseModelListResponseModel => r.body)
    );
  }

}
