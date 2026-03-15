/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { authForgotPasswordPost } from '../fn/auth/auth-forgot-password-post';
import { AuthForgotPasswordPost$Params } from '../fn/auth/auth-forgot-password-post';
import { authLoginPost } from '../fn/auth/auth-login-post';
import { AuthLoginPost$Params } from '../fn/auth/auth-login-post';
import { authLogoutPost } from '../fn/auth/auth-logout-post';
import { AuthLogoutPost$Params } from '../fn/auth/auth-logout-post';
import { authRefreshTokenPost } from '../fn/auth/auth-refresh-token-post';
import { AuthRefreshTokenPost$Params } from '../fn/auth/auth-refresh-token-post';
import { authResetPasswordPost } from '../fn/auth/auth-reset-password-post';
import { AuthResetPasswordPost$Params } from '../fn/auth/auth-reset-password-post';
import { authVerifyOtpPost } from '../fn/auth/auth-verify-otp-post';
import { AuthVerifyOtpPost$Params } from '../fn/auth/auth-verify-otp-post';
import { authVerifyPasswordPost } from '../fn/auth/auth-verify-password-post';
import { AuthVerifyPasswordPost$Params } from '../fn/auth/auth-verify-password-post';
import { BooleanBaseResponseModel } from '../models/boolean-base-response-model';
import { ForgotPasswordResponseModelBaseResponseModel } from '../models/forgot-password-response-model-base-response-model';
import { LoginResponseModelBaseResponseModel } from '../models/login-response-model-base-response-model';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';
import { TokenResponseModelBaseResponseModel } from '../models/token-response-model-base-response-model';
import { VerifyOtpResponseModelBaseResponseModel } from '../models/verify-otp-response-model-base-response-model';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `authLoginPost()` */
  static readonly AuthLoginPostPath = '/api/admin/auth/login';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authLoginPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authLoginPost$Response(params?: AuthLoginPost$Params, context?: HttpContext): Observable<StrictHttpResponse<LoginResponseModelBaseResponseModel>> {
    return authLoginPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authLoginPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authLoginPost(params?: AuthLoginPost$Params, context?: HttpContext): Observable<LoginResponseModelBaseResponseModel> {
    return this.authLoginPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<LoginResponseModelBaseResponseModel>): LoginResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `authLogoutPost()` */
  static readonly AuthLogoutPostPath = '/api/admin/auth/logout';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authLogoutPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authLogoutPost$Response(params?: AuthLogoutPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return authLogoutPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authLogoutPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authLogoutPost(params?: AuthLogoutPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.authLogoutPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `authRefreshTokenPost()` */
  static readonly AuthRefreshTokenPostPath = '/api/admin/auth/refresh-token';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authRefreshTokenPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authRefreshTokenPost$Response(params?: AuthRefreshTokenPost$Params, context?: HttpContext): Observable<StrictHttpResponse<TokenResponseModelBaseResponseModel>> {
    return authRefreshTokenPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authRefreshTokenPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authRefreshTokenPost(params?: AuthRefreshTokenPost$Params, context?: HttpContext): Observable<TokenResponseModelBaseResponseModel> {
    return this.authRefreshTokenPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<TokenResponseModelBaseResponseModel>): TokenResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `authForgotPasswordPost()` */
  static readonly AuthForgotPasswordPostPath = '/api/admin/auth/forgot-password';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authForgotPasswordPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authForgotPasswordPost$Response(params?: AuthForgotPasswordPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ForgotPasswordResponseModelBaseResponseModel>> {
    return authForgotPasswordPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authForgotPasswordPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authForgotPasswordPost(params?: AuthForgotPasswordPost$Params, context?: HttpContext): Observable<ForgotPasswordResponseModelBaseResponseModel> {
    return this.authForgotPasswordPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ForgotPasswordResponseModelBaseResponseModel>): ForgotPasswordResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `authVerifyOtpPost()` */
  static readonly AuthVerifyOtpPostPath = '/api/admin/auth/verify-otp';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authVerifyOtpPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authVerifyOtpPost$Response(params?: AuthVerifyOtpPost$Params, context?: HttpContext): Observable<StrictHttpResponse<VerifyOtpResponseModelBaseResponseModel>> {
    return authVerifyOtpPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authVerifyOtpPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authVerifyOtpPost(params?: AuthVerifyOtpPost$Params, context?: HttpContext): Observable<VerifyOtpResponseModelBaseResponseModel> {
    return this.authVerifyOtpPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<VerifyOtpResponseModelBaseResponseModel>): VerifyOtpResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `authResetPasswordPost()` */
  static readonly AuthResetPasswordPostPath = '/api/admin/auth/reset-password';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authResetPasswordPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authResetPasswordPost$Response(params?: AuthResetPasswordPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return authResetPasswordPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authResetPasswordPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authResetPasswordPost(params?: AuthResetPasswordPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.authResetPasswordPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `authVerifyPasswordPost()` */
  static readonly AuthVerifyPasswordPostPath = '/api/admin/auth/verify-password';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authVerifyPasswordPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authVerifyPasswordPost$Response(params?: AuthVerifyPasswordPost$Params, context?: HttpContext): Observable<StrictHttpResponse<BooleanBaseResponseModel>> {
    return authVerifyPasswordPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authVerifyPasswordPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  authVerifyPasswordPost(params?: AuthVerifyPasswordPost$Params, context?: HttpContext): Observable<BooleanBaseResponseModel> {
    return this.authVerifyPasswordPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<BooleanBaseResponseModel>): BooleanBaseResponseModel => r.body)
    );
  }

}
