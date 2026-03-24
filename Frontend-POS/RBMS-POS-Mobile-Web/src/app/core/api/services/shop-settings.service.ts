/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ShopBrandingResponseModelBaseResponseModel } from '../models/shop-branding-response-model-base-response-model';
import { shopSettingsGetBrandingGet } from '../fn/shop-settings/shop-settings-get-branding-get';
import { ShopSettingsGetBrandingGet$Params } from '../fn/shop-settings/shop-settings-get-branding-get';
import { shopSettingsGetGet } from '../fn/shop-settings/shop-settings-get-get';
import { ShopSettingsGetGet$Params } from '../fn/shop-settings/shop-settings-get-get';
import { shopSettingsGetWelcomeShopInfoGet } from '../fn/shop-settings/shop-settings-get-welcome-shop-info-get';
import { ShopSettingsGetWelcomeShopInfoGet$Params } from '../fn/shop-settings/shop-settings-get-welcome-shop-info-get';
import { ShopSettingsResponseModelBaseResponseModel } from '../models/shop-settings-response-model-base-response-model';
import { shopSettingsUpdatePut } from '../fn/shop-settings/shop-settings-update-put';
import { ShopSettingsUpdatePut$Params } from '../fn/shop-settings/shop-settings-update-put';
import { WelcomeShopInfoResponseModelBaseResponseModel } from '../models/welcome-shop-info-response-model-base-response-model';

@Injectable({ providedIn: 'root' })
export class ShopSettingsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `shopSettingsGetBrandingGet()` */
  static readonly ShopSettingsGetBrandingGetPath = '/api/admin/shop-settings/branding';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `shopSettingsGetBrandingGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  shopSettingsGetBrandingGet$Response(params?: ShopSettingsGetBrandingGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ShopBrandingResponseModelBaseResponseModel>> {
    return shopSettingsGetBrandingGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `shopSettingsGetBrandingGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  shopSettingsGetBrandingGet(params?: ShopSettingsGetBrandingGet$Params, context?: HttpContext): Observable<ShopBrandingResponseModelBaseResponseModel> {
    return this.shopSettingsGetBrandingGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ShopBrandingResponseModelBaseResponseModel>): ShopBrandingResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `shopSettingsGetWelcomeShopInfoGet()` */
  static readonly ShopSettingsGetWelcomeShopInfoGetPath = '/api/admin/shop-settings/welcome';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `shopSettingsGetWelcomeShopInfoGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  shopSettingsGetWelcomeShopInfoGet$Response(params?: ShopSettingsGetWelcomeShopInfoGet$Params, context?: HttpContext): Observable<StrictHttpResponse<WelcomeShopInfoResponseModelBaseResponseModel>> {
    return shopSettingsGetWelcomeShopInfoGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `shopSettingsGetWelcomeShopInfoGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  shopSettingsGetWelcomeShopInfoGet(params?: ShopSettingsGetWelcomeShopInfoGet$Params, context?: HttpContext): Observable<WelcomeShopInfoResponseModelBaseResponseModel> {
    return this.shopSettingsGetWelcomeShopInfoGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<WelcomeShopInfoResponseModelBaseResponseModel>): WelcomeShopInfoResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `shopSettingsGetGet()` */
  static readonly ShopSettingsGetGetPath = '/api/admin/shop-settings';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `shopSettingsGetGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  shopSettingsGetGet$Response(params?: ShopSettingsGetGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ShopSettingsResponseModelBaseResponseModel>> {
    return shopSettingsGetGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `shopSettingsGetGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  shopSettingsGetGet(params?: ShopSettingsGetGet$Params, context?: HttpContext): Observable<ShopSettingsResponseModelBaseResponseModel> {
    return this.shopSettingsGetGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ShopSettingsResponseModelBaseResponseModel>): ShopSettingsResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `shopSettingsUpdatePut()` */
  static readonly ShopSettingsUpdatePutPath = '/api/admin/shop-settings';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `shopSettingsUpdatePut()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  shopSettingsUpdatePut$Response(params?: ShopSettingsUpdatePut$Params, context?: HttpContext): Observable<StrictHttpResponse<ShopSettingsResponseModelBaseResponseModel>> {
    return shopSettingsUpdatePut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `shopSettingsUpdatePut$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  shopSettingsUpdatePut(params?: ShopSettingsUpdatePut$Params, context?: HttpContext): Observable<ShopSettingsResponseModelBaseResponseModel> {
    return this.shopSettingsUpdatePut$Response(params, context).pipe(
      map((r: StrictHttpResponse<ShopSettingsResponseModelBaseResponseModel>): ShopSettingsResponseModelBaseResponseModel => r.body)
    );
  }

}
