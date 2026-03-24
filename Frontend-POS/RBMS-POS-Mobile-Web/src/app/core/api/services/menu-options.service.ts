/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { menuOptionsCreateOptionGroupPost } from '../fn/menu-options/menu-options-create-option-group-post';
import { MenuOptionsCreateOptionGroupPost$Params } from '../fn/menu-options/menu-options-create-option-group-post';
import { menuOptionsDeleteOptionGroupDelete } from '../fn/menu-options/menu-options-delete-option-group-delete';
import { MenuOptionsDeleteOptionGroupDelete$Params } from '../fn/menu-options/menu-options-delete-option-group-delete';
import { menuOptionsGetAllOptionGroupsGet } from '../fn/menu-options/menu-options-get-all-option-groups-get';
import { MenuOptionsGetAllOptionGroupsGet$Params } from '../fn/menu-options/menu-options-get-all-option-groups-get';
import { menuOptionsGetOptionGroupGet } from '../fn/menu-options/menu-options-get-option-group-get';
import { MenuOptionsGetOptionGroupGet$Params } from '../fn/menu-options/menu-options-get-option-group-get';
import { menuOptionsGetOptionGroupsGet } from '../fn/menu-options/menu-options-get-option-groups-get';
import { MenuOptionsGetOptionGroupsGet$Params } from '../fn/menu-options/menu-options-get-option-groups-get';
import { menuOptionsUpdateOptionGroupPut } from '../fn/menu-options/menu-options-update-option-group-put';
import { MenuOptionsUpdateOptionGroupPut$Params } from '../fn/menu-options/menu-options-update-option-group-put';
import { OptionGroupResponseModelBaseResponseModel } from '../models/option-group-response-model-base-response-model';
import { OptionGroupResponseModelPaginationResult } from '../models/option-group-response-model-pagination-result';

@Injectable({ providedIn: 'root' })
export class MenuOptionsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `menuOptionsGetAllOptionGroupsGet()` */
  static readonly MenuOptionsGetAllOptionGroupsGetPath = '/api/menu/options';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuOptionsGetAllOptionGroupsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuOptionsGetAllOptionGroupsGet$Response(params?: MenuOptionsGetAllOptionGroupsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OptionGroupResponseModelPaginationResult>> {
    return menuOptionsGetAllOptionGroupsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuOptionsGetAllOptionGroupsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuOptionsGetAllOptionGroupsGet(params?: MenuOptionsGetAllOptionGroupsGet$Params, context?: HttpContext): Observable<OptionGroupResponseModelPaginationResult> {
    return this.menuOptionsGetAllOptionGroupsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<OptionGroupResponseModelPaginationResult>): OptionGroupResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `menuOptionsCreateOptionGroupPost()` */
  static readonly MenuOptionsCreateOptionGroupPostPath = '/api/menu/options';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuOptionsCreateOptionGroupPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuOptionsCreateOptionGroupPost$Response(params?: MenuOptionsCreateOptionGroupPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>> {
    return menuOptionsCreateOptionGroupPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuOptionsCreateOptionGroupPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuOptionsCreateOptionGroupPost(params?: MenuOptionsCreateOptionGroupPost$Params, context?: HttpContext): Observable<OptionGroupResponseModelBaseResponseModel> {
    return this.menuOptionsCreateOptionGroupPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>): OptionGroupResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menuOptionsGetOptionGroupsGet()` */
  static readonly MenuOptionsGetOptionGroupsGetPath = '/api/menu/options/type/{categoryType}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuOptionsGetOptionGroupsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuOptionsGetOptionGroupsGet$Response(params: MenuOptionsGetOptionGroupsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OptionGroupResponseModelPaginationResult>> {
    return menuOptionsGetOptionGroupsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuOptionsGetOptionGroupsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuOptionsGetOptionGroupsGet(params: MenuOptionsGetOptionGroupsGet$Params, context?: HttpContext): Observable<OptionGroupResponseModelPaginationResult> {
    return this.menuOptionsGetOptionGroupsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<OptionGroupResponseModelPaginationResult>): OptionGroupResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `menuOptionsGetOptionGroupGet()` */
  static readonly MenuOptionsGetOptionGroupGetPath = '/api/menu/options/{optionGroupId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuOptionsGetOptionGroupGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuOptionsGetOptionGroupGet$Response(params: MenuOptionsGetOptionGroupGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>> {
    return menuOptionsGetOptionGroupGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuOptionsGetOptionGroupGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuOptionsGetOptionGroupGet(params: MenuOptionsGetOptionGroupGet$Params, context?: HttpContext): Observable<OptionGroupResponseModelBaseResponseModel> {
    return this.menuOptionsGetOptionGroupGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>): OptionGroupResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menuOptionsUpdateOptionGroupPut()` */
  static readonly MenuOptionsUpdateOptionGroupPutPath = '/api/menu/options/{optionGroupId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuOptionsUpdateOptionGroupPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuOptionsUpdateOptionGroupPut$Response(params: MenuOptionsUpdateOptionGroupPut$Params, context?: HttpContext): Observable<StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>> {
    return menuOptionsUpdateOptionGroupPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuOptionsUpdateOptionGroupPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  menuOptionsUpdateOptionGroupPut(params: MenuOptionsUpdateOptionGroupPut$Params, context?: HttpContext): Observable<OptionGroupResponseModelBaseResponseModel> {
    return this.menuOptionsUpdateOptionGroupPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<OptionGroupResponseModelBaseResponseModel>): OptionGroupResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `menuOptionsDeleteOptionGroupDelete()` */
  static readonly MenuOptionsDeleteOptionGroupDeletePath = '/api/menu/options/{optionGroupId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `menuOptionsDeleteOptionGroupDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuOptionsDeleteOptionGroupDelete$Response(params: MenuOptionsDeleteOptionGroupDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return menuOptionsDeleteOptionGroupDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `menuOptionsDeleteOptionGroupDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  menuOptionsDeleteOptionGroupDelete(params: MenuOptionsDeleteOptionGroupDelete$Params, context?: HttpContext): Observable<void> {
    return this.menuOptionsDeleteOptionGroupDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
