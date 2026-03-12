/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { apiAdminAuthLoginPost } from '../fn/auth/api-admin-auth-login-post';
import { ApiAdminAuthLoginPost$Params } from '../fn/auth/api-admin-auth-login-post';
import { apiAdminAuthLogoutPost } from '../fn/auth/api-admin-auth-logout-post';
import { ApiAdminAuthLogoutPost$Params } from '../fn/auth/api-admin-auth-logout-post';
import { apiAdminAuthRefreshTokenPost } from '../fn/auth/api-admin-auth-refresh-token-post';
import { ApiAdminAuthRefreshTokenPost$Params } from '../fn/auth/api-admin-auth-refresh-token-post';
import { LoginResponseModelBaseResponseModel } from '../models/login-response-model-base-response-model';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';
import { TokenResponseModelBaseResponseModel } from '../models/token-response-model-base-response-model';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `apiAdminAuthLoginPost()` */
  static readonly ApiAdminAuthLoginPostPath = '/api/admin/auth/login';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminAuthLoginPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminAuthLoginPost$Response(params?: ApiAdminAuthLoginPost$Params, context?: HttpContext): Observable<StrictHttpResponse<LoginResponseModelBaseResponseModel>> {
    return apiAdminAuthLoginPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminAuthLoginPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminAuthLoginPost(params?: ApiAdminAuthLoginPost$Params, context?: HttpContext): Observable<LoginResponseModelBaseResponseModel> {
    return this.apiAdminAuthLoginPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<LoginResponseModelBaseResponseModel>): LoginResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminAuthLogoutPost()` */
  static readonly ApiAdminAuthLogoutPostPath = '/api/admin/auth/logout';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminAuthLogoutPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminAuthLogoutPost$Response(params?: ApiAdminAuthLogoutPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return apiAdminAuthLogoutPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminAuthLogoutPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminAuthLogoutPost(params?: ApiAdminAuthLogoutPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.apiAdminAuthLogoutPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminAuthRefreshTokenPost()` */
  static readonly ApiAdminAuthRefreshTokenPostPath = '/api/admin/auth/refresh-token';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminAuthRefreshTokenPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminAuthRefreshTokenPost$Response(params?: ApiAdminAuthRefreshTokenPost$Params, context?: HttpContext): Observable<StrictHttpResponse<TokenResponseModelBaseResponseModel>> {
    return apiAdminAuthRefreshTokenPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminAuthRefreshTokenPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminAuthRefreshTokenPost(params?: ApiAdminAuthRefreshTokenPost$Params, context?: HttpContext): Observable<TokenResponseModelBaseResponseModel> {
    return this.apiAdminAuthRefreshTokenPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<TokenResponseModelBaseResponseModel>): TokenResponseModelBaseResponseModel => r.body)
    );
  }

}
