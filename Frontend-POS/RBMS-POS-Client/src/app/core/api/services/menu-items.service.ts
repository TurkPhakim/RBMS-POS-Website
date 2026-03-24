/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { menuItemsCreateMenuPost } from '../fn/menu-items/menu-items-create-menu-post';
import { MenuItemsCreateMenuPost$Params } from '../fn/menu-items/menu-items-create-menu-post';
import { menuItemsDeleteMenuDelete } from '../fn/menu-items/menu-items-delete-menu-delete';
import { MenuItemsDeleteMenuDelete$Params } from '../fn/menu-items/menu-items-delete-menu-delete';
import { menuItemsGetMenuGet } from '../fn/menu-items/menu-items-get-menu-get';
import { MenuItemsGetMenuGet$Params } from '../fn/menu-items/menu-items-get-menu-get';
import { menuItemsGetMenusGet } from '../fn/menu-items/menu-items-get-menus-get';
import { MenuItemsGetMenusGet$Params } from '../fn/menu-items/menu-items-get-menus-get';
import { menuItemsUpdateMenuPut } from '../fn/menu-items/menu-items-update-menu-put';
import { MenuItemsUpdateMenuPut$Params } from '../fn/menu-items/menu-items-update-menu-put';
import { MenuResponseModelBaseResponseModel } from '../models/menu-response-model-base-response-model';
import { MenuResponseModelPaginationResult } from '../models/menu-response-model-pagination-result';

@Injectable({ providedIn: 'root' })
export class MenuItemsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `menuItemsGetMenusGet()` */
  static readonly MenuItemsGetMenusGetPath = '/api/menu/items';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuItemsGetMenusGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuItemsGetMenusGet$Response(params?: MenuItemsGetMenusGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelPaginationResult>> {
    return menuItemsGetMenusGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuItemsGetMenusGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuItemsGetMenusGet(params?: MenuItemsGetMenusGet$Params, context?: HttpContext): Observable<MenuResponseModelPaginationResult> {
    return this.menuItemsGetMenusGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelPaginationResult>): MenuResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `menuItemsCreateMenuPost()` */
  static readonly MenuItemsCreateMenuPostPath = '/api/menu/items';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuItemsCreateMenuPost()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  menuItemsCreateMenuPost$Response(params?: MenuItemsCreateMenuPost$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
    return menuItemsCreateMenuPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuItemsCreateMenuPost$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  menuItemsCreateMenuPost(params?: MenuItemsCreateMenuPost$Params, context?: HttpContext): Observable<MenuResponseModelBaseResponseModel> {
    return this.menuItemsCreateMenuPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelBaseResponseModel>): MenuResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menuItemsGetMenuGet()` */
  static readonly MenuItemsGetMenuGetPath = '/api/menu/items/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuItemsGetMenuGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuItemsGetMenuGet$Response(params: MenuItemsGetMenuGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
    return menuItemsGetMenuGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuItemsGetMenuGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuItemsGetMenuGet(params: MenuItemsGetMenuGet$Params, context?: HttpContext): Observable<MenuResponseModelBaseResponseModel> {
    return this.menuItemsGetMenuGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelBaseResponseModel>): MenuResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menuItemsUpdateMenuPut()` */
  static readonly MenuItemsUpdateMenuPutPath = '/api/menu/items/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuItemsUpdateMenuPut()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  menuItemsUpdateMenuPut$Response(params: MenuItemsUpdateMenuPut$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuResponseModelBaseResponseModel>> {
    return menuItemsUpdateMenuPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuItemsUpdateMenuPut$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  menuItemsUpdateMenuPut(params: MenuItemsUpdateMenuPut$Params, context?: HttpContext): Observable<MenuResponseModelBaseResponseModel> {
    return this.menuItemsUpdateMenuPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuResponseModelBaseResponseModel>): MenuResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menuItemsDeleteMenuDelete()` */
  static readonly MenuItemsDeleteMenuDeletePath = '/api/menu/items/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuItemsDeleteMenuDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuItemsDeleteMenuDelete$Response(params: MenuItemsDeleteMenuDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return menuItemsDeleteMenuDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuItemsDeleteMenuDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuItemsDeleteMenuDelete(params: MenuItemsDeleteMenuDelete$Params, context?: HttpContext): Observable<void> {
    return this.menuItemsDeleteMenuDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
