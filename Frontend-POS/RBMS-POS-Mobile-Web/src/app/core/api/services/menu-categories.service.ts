/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { menuCategoriesCreateSubCategoryPost } from '../fn/menu-categories/menu-categories-create-sub-category-post';
import { MenuCategoriesCreateSubCategoryPost$Params } from '../fn/menu-categories/menu-categories-create-sub-category-post';
import { menuCategoriesDeleteSubCategoryDelete } from '../fn/menu-categories/menu-categories-delete-sub-category-delete';
import { MenuCategoriesDeleteSubCategoryDelete$Params } from '../fn/menu-categories/menu-categories-delete-sub-category-delete';
import { menuCategoriesGetSubCategoriesGet } from '../fn/menu-categories/menu-categories-get-sub-categories-get';
import { MenuCategoriesGetSubCategoriesGet$Params } from '../fn/menu-categories/menu-categories-get-sub-categories-get';
import { menuCategoriesGetSubCategoryGet } from '../fn/menu-categories/menu-categories-get-sub-category-get';
import { MenuCategoriesGetSubCategoryGet$Params } from '../fn/menu-categories/menu-categories-get-sub-category-get';
import { menuCategoriesUpdateSortOrderPut } from '../fn/menu-categories/menu-categories-update-sort-order-put';
import { MenuCategoriesUpdateSortOrderPut$Params } from '../fn/menu-categories/menu-categories-update-sort-order-put';
import { menuCategoriesUpdateSubCategoryPut } from '../fn/menu-categories/menu-categories-update-sub-category-put';
import { MenuCategoriesUpdateSubCategoryPut$Params } from '../fn/menu-categories/menu-categories-update-sub-category-put';
import { MenuSubCategoryResponseModelBaseResponseModel } from '../models/menu-sub-category-response-model-base-response-model';
import { MenuSubCategoryResponseModelPaginationResult } from '../models/menu-sub-category-response-model-pagination-result';

@Injectable({ providedIn: 'root' })
export class MenuCategoriesService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `menuCategoriesGetSubCategoriesGet()` */
  static readonly MenuCategoriesGetSubCategoriesGetPath = '/api/menu/categories/type/{categoryType}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuCategoriesGetSubCategoriesGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuCategoriesGetSubCategoriesGet$Response(params: MenuCategoriesGetSubCategoriesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuSubCategoryResponseModelPaginationResult>> {
    return menuCategoriesGetSubCategoriesGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuCategoriesGetSubCategoriesGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuCategoriesGetSubCategoriesGet(params: MenuCategoriesGetSubCategoriesGet$Params, context?: HttpContext): Observable<MenuSubCategoryResponseModelPaginationResult> {
    return this.menuCategoriesGetSubCategoriesGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuSubCategoryResponseModelPaginationResult>): MenuSubCategoryResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `menuCategoriesGetSubCategoryGet()` */
  static readonly MenuCategoriesGetSubCategoryGetPath = '/api/menu/categories/{subCategoryId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuCategoriesGetSubCategoryGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuCategoriesGetSubCategoryGet$Response(params: MenuCategoriesGetSubCategoryGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuSubCategoryResponseModelBaseResponseModel>> {
    return menuCategoriesGetSubCategoryGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuCategoriesGetSubCategoryGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuCategoriesGetSubCategoryGet(params: MenuCategoriesGetSubCategoryGet$Params, context?: HttpContext): Observable<MenuSubCategoryResponseModelBaseResponseModel> {
    return this.menuCategoriesGetSubCategoryGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuSubCategoryResponseModelBaseResponseModel>): MenuSubCategoryResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menuCategoriesUpdateSubCategoryPut()` */
  static readonly MenuCategoriesUpdateSubCategoryPutPath = '/api/menu/categories/{subCategoryId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuCategoriesUpdateSubCategoryPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuCategoriesUpdateSubCategoryPut$Response(params: MenuCategoriesUpdateSubCategoryPut$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuSubCategoryResponseModelBaseResponseModel>> {
    return menuCategoriesUpdateSubCategoryPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuCategoriesUpdateSubCategoryPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuCategoriesUpdateSubCategoryPut(params: MenuCategoriesUpdateSubCategoryPut$Params, context?: HttpContext): Observable<MenuSubCategoryResponseModelBaseResponseModel> {
    return this.menuCategoriesUpdateSubCategoryPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuSubCategoryResponseModelBaseResponseModel>): MenuSubCategoryResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menuCategoriesDeleteSubCategoryDelete()` */
  static readonly MenuCategoriesDeleteSubCategoryDeletePath = '/api/menu/categories/{subCategoryId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuCategoriesDeleteSubCategoryDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuCategoriesDeleteSubCategoryDelete$Response(params: MenuCategoriesDeleteSubCategoryDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return menuCategoriesDeleteSubCategoryDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuCategoriesDeleteSubCategoryDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuCategoriesDeleteSubCategoryDelete(params: MenuCategoriesDeleteSubCategoryDelete$Params, context?: HttpContext): Observable<void> {
    return this.menuCategoriesDeleteSubCategoryDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `menuCategoriesCreateSubCategoryPost()` */
  static readonly MenuCategoriesCreateSubCategoryPostPath = '/api/menu/categories';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuCategoriesCreateSubCategoryPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuCategoriesCreateSubCategoryPost$Response(params?: MenuCategoriesCreateSubCategoryPost$Params, context?: HttpContext): Observable<StrictHttpResponse<MenuSubCategoryResponseModelBaseResponseModel>> {
    return menuCategoriesCreateSubCategoryPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuCategoriesCreateSubCategoryPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuCategoriesCreateSubCategoryPost(params?: MenuCategoriesCreateSubCategoryPost$Params, context?: HttpContext): Observable<MenuSubCategoryResponseModelBaseResponseModel> {
    return this.menuCategoriesCreateSubCategoryPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<MenuSubCategoryResponseModelBaseResponseModel>): MenuSubCategoryResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menuCategoriesUpdateSortOrderPut()` */
  static readonly MenuCategoriesUpdateSortOrderPutPath = '/api/menu/categories/sort-order';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuCategoriesUpdateSortOrderPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuCategoriesUpdateSortOrderPut$Response(params?: MenuCategoriesUpdateSortOrderPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return menuCategoriesUpdateSortOrderPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuCategoriesUpdateSortOrderPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuCategoriesUpdateSortOrderPut(params?: MenuCategoriesUpdateSortOrderPut$Params, context?: HttpContext): Observable<void> {
    return this.menuCategoriesUpdateSortOrderPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
