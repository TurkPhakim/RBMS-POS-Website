/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ObjectBaseResponseModel } from '../models/object-base-response-model';
import { UserDetailResponseModelBaseResponseModel } from '../models/user-detail-response-model-base-response-model';
import { UserListResponseModelPaginationResult } from '../models/user-list-response-model-pagination-result';
import { usersGetUserGet } from '../fn/users/users-get-user-get';
import { UsersGetUserGet$Params } from '../fn/users/users-get-user-get';
import { usersGetUsersGet } from '../fn/users/users-get-users-get';
import { UsersGetUsersGet$Params } from '../fn/users/users-get-users-get';
import { usersResetLoginAttemptsPost } from '../fn/users/users-reset-login-attempts-post';
import { UsersResetLoginAttemptsPost$Params } from '../fn/users/users-reset-login-attempts-post';
import { usersUpdateUserSettingsPut } from '../fn/users/users-update-user-settings-put';
import { UsersUpdateUserSettingsPut$Params } from '../fn/users/users-update-user-settings-put';

@Injectable({ providedIn: 'root' })
export class UsersService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `usersGetUsersGet()` */
  static readonly UsersGetUsersGetPath = '/api/admin/users';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersGetUsersGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersGetUsersGet$Response(params?: UsersGetUsersGet$Params, context?: HttpContext): Observable<StrictHttpResponse<UserListResponseModelPaginationResult>> {
    return usersGetUsersGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `usersGetUsersGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersGetUsersGet(params?: UsersGetUsersGet$Params, context?: HttpContext): Observable<UserListResponseModelPaginationResult> {
    return this.usersGetUsersGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserListResponseModelPaginationResult>): UserListResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `usersGetUserGet()` */
  static readonly UsersGetUserGetPath = '/api/admin/users/{userId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersGetUserGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersGetUserGet$Response(params: UsersGetUserGet$Params, context?: HttpContext): Observable<StrictHttpResponse<UserDetailResponseModelBaseResponseModel>> {
    return usersGetUserGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `usersGetUserGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersGetUserGet(params: UsersGetUserGet$Params, context?: HttpContext): Observable<UserDetailResponseModelBaseResponseModel> {
    return this.usersGetUserGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserDetailResponseModelBaseResponseModel>): UserDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `usersUpdateUserSettingsPut()` */
  static readonly UsersUpdateUserSettingsPutPath = '/api/admin/users/{userId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersUpdateUserSettingsPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  usersUpdateUserSettingsPut$Response(params: UsersUpdateUserSettingsPut$Params, context?: HttpContext): Observable<StrictHttpResponse<UserDetailResponseModelBaseResponseModel>> {
    return usersUpdateUserSettingsPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `usersUpdateUserSettingsPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  usersUpdateUserSettingsPut(params: UsersUpdateUserSettingsPut$Params, context?: HttpContext): Observable<UserDetailResponseModelBaseResponseModel> {
    return this.usersUpdateUserSettingsPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserDetailResponseModelBaseResponseModel>): UserDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `usersResetLoginAttemptsPost()` */
  static readonly UsersResetLoginAttemptsPostPath = '/api/admin/users/{userId}/reset-login-attempts';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersResetLoginAttemptsPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersResetLoginAttemptsPost$Response(params: UsersResetLoginAttemptsPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return usersResetLoginAttemptsPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `usersResetLoginAttemptsPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersResetLoginAttemptsPost(params: UsersResetLoginAttemptsPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.usersResetLoginAttemptsPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

}
