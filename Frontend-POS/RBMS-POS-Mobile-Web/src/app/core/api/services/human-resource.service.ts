/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { BooleanBaseResponseModel } from '../models/boolean-base-response-model';
import { CreateUserAccountResponseModelBaseResponseModel } from '../models/create-user-account-response-model-base-response-model';
import { EmployeeAddressResponseModelBaseResponseModel } from '../models/employee-address-response-model-base-response-model';
import { EmployeeEducationResponseModelBaseResponseModel } from '../models/employee-education-response-model-base-response-model';
import { EmployeeResponseModelBaseResponseModel } from '../models/employee-response-model-base-response-model';
import { EmployeeResponseModelPaginationResult } from '../models/employee-response-model-pagination-result';
import { EmployeeWorkHistoryResponseModelBaseResponseModel } from '../models/employee-work-history-response-model-base-response-model';
import { humanResourceCheckDuplicateGet } from '../fn/human-resource/human-resource-check-duplicate-get';
import { HumanResourceCheckDuplicateGet$Params } from '../fn/human-resource/human-resource-check-duplicate-get';
import { humanResourceCreateAddressPost } from '../fn/human-resource/human-resource-create-address-post';
import { HumanResourceCreateAddressPost$Params } from '../fn/human-resource/human-resource-create-address-post';
import { humanResourceCreateEducationPost } from '../fn/human-resource/human-resource-create-education-post';
import { HumanResourceCreateEducationPost$Params } from '../fn/human-resource/human-resource-create-education-post';
import { humanResourceCreatePost } from '../fn/human-resource/human-resource-create-post';
import { HumanResourceCreatePost$Params } from '../fn/human-resource/human-resource-create-post';
import { humanResourceCreateUserAccountPost } from '../fn/human-resource/human-resource-create-user-account-post';
import { HumanResourceCreateUserAccountPost$Params } from '../fn/human-resource/human-resource-create-user-account-post';
import { humanResourceCreateWorkHistoryPost } from '../fn/human-resource/human-resource-create-work-history-post';
import { HumanResourceCreateWorkHistoryPost$Params } from '../fn/human-resource/human-resource-create-work-history-post';
import { humanResourceDeleteAddressDelete } from '../fn/human-resource/human-resource-delete-address-delete';
import { HumanResourceDeleteAddressDelete$Params } from '../fn/human-resource/human-resource-delete-address-delete';
import { humanResourceDeleteDelete } from '../fn/human-resource/human-resource-delete-delete';
import { HumanResourceDeleteDelete$Params } from '../fn/human-resource/human-resource-delete-delete';
import { humanResourceDeleteEducationDelete } from '../fn/human-resource/human-resource-delete-education-delete';
import { HumanResourceDeleteEducationDelete$Params } from '../fn/human-resource/human-resource-delete-education-delete';
import { humanResourceDeleteWorkHistoryDelete } from '../fn/human-resource/human-resource-delete-work-history-delete';
import { HumanResourceDeleteWorkHistoryDelete$Params } from '../fn/human-resource/human-resource-delete-work-history-delete';
import { humanResourceGetByIdGet } from '../fn/human-resource/human-resource-get-by-id-get';
import { HumanResourceGetByIdGet$Params } from '../fn/human-resource/human-resource-get-by-id-get';
import { humanResourceGetByUserIdGet } from '../fn/human-resource/human-resource-get-by-user-id-get';
import { HumanResourceGetByUserIdGet$Params } from '../fn/human-resource/human-resource-get-by-user-id-get';
import { humanResourceGetEmployeesGet } from '../fn/human-resource/human-resource-get-employees-get';
import { HumanResourceGetEmployeesGet$Params } from '../fn/human-resource/human-resource-get-employees-get';
import { humanResourceGetMyFullProfileGet } from '../fn/human-resource/human-resource-get-my-full-profile-get';
import { HumanResourceGetMyFullProfileGet$Params } from '../fn/human-resource/human-resource-get-my-full-profile-get';
import { humanResourceGetMyProfileGet } from '../fn/human-resource/human-resource-get-my-profile-get';
import { HumanResourceGetMyProfileGet$Params } from '../fn/human-resource/human-resource-get-my-profile-get';
import { humanResourceUpdateAddressPut } from '../fn/human-resource/human-resource-update-address-put';
import { HumanResourceUpdateAddressPut$Params } from '../fn/human-resource/human-resource-update-address-put';
import { humanResourceUpdateEducationPut } from '../fn/human-resource/human-resource-update-education-put';
import { HumanResourceUpdateEducationPut$Params } from '../fn/human-resource/human-resource-update-education-put';
import { humanResourceUpdateMyProfilePut } from '../fn/human-resource/human-resource-update-my-profile-put';
import { HumanResourceUpdateMyProfilePut$Params } from '../fn/human-resource/human-resource-update-my-profile-put';
import { humanResourceUpdatePut } from '../fn/human-resource/human-resource-update-put';
import { HumanResourceUpdatePut$Params } from '../fn/human-resource/human-resource-update-put';
import { humanResourceUpdateWorkHistoryPut } from '../fn/human-resource/human-resource-update-work-history-put';
import { HumanResourceUpdateWorkHistoryPut$Params } from '../fn/human-resource/human-resource-update-work-history-put';
import { MyProfileResponseModelBaseResponseModel } from '../models/my-profile-response-model-base-response-model';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';

@Injectable({ providedIn: 'root' })
export class HumanResourceService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `humanResourceGetMyProfileGet()` */
  static readonly HumanResourceGetMyProfileGetPath = '/api/humanresource/me';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceGetMyProfileGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetMyProfileGet$Response(params?: HumanResourceGetMyProfileGet$Params, context?: HttpContext): Observable<StrictHttpResponse<MyProfileResponseModelBaseResponseModel>> {
    return humanResourceGetMyProfileGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceGetMyProfileGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetMyProfileGet(params?: HumanResourceGetMyProfileGet$Params, context?: HttpContext): Observable<MyProfileResponseModelBaseResponseModel> {
    return this.humanResourceGetMyProfileGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<MyProfileResponseModelBaseResponseModel>): MyProfileResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceGetMyFullProfileGet()` */
  static readonly HumanResourceGetMyFullProfileGetPath = '/api/humanresource/me/profile';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceGetMyFullProfileGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetMyFullProfileGet$Response(params?: HumanResourceGetMyFullProfileGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return humanResourceGetMyFullProfileGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceGetMyFullProfileGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetMyFullProfileGet(params?: HumanResourceGetMyFullProfileGet$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.humanResourceGetMyFullProfileGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceUpdateMyProfilePut()` */
  static readonly HumanResourceUpdateMyProfilePutPath = '/api/humanresource/me/profile';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceUpdateMyProfilePut()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  humanResourceUpdateMyProfilePut$Response(params?: HumanResourceUpdateMyProfilePut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return humanResourceUpdateMyProfilePut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceUpdateMyProfilePut$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  humanResourceUpdateMyProfilePut(params?: HumanResourceUpdateMyProfilePut$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.humanResourceUpdateMyProfilePut$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceGetEmployeesGet()` */
  static readonly HumanResourceGetEmployeesGetPath = '/api/humanresource';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceGetEmployeesGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetEmployeesGet$Response(params?: HumanResourceGetEmployeesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelPaginationResult>> {
    return humanResourceGetEmployeesGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceGetEmployeesGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetEmployeesGet(params?: HumanResourceGetEmployeesGet$Params, context?: HttpContext): Observable<EmployeeResponseModelPaginationResult> {
    return this.humanResourceGetEmployeesGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelPaginationResult>): EmployeeResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `humanResourceCreatePost()` */
  static readonly HumanResourceCreatePostPath = '/api/humanresource';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceCreatePost()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  humanResourceCreatePost$Response(params?: HumanResourceCreatePost$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return humanResourceCreatePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceCreatePost$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  humanResourceCreatePost(params?: HumanResourceCreatePost$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.humanResourceCreatePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceGetByIdGet()` */
  static readonly HumanResourceGetByIdGetPath = '/api/humanresource/{employeeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceGetByIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetByIdGet$Response(params: HumanResourceGetByIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return humanResourceGetByIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceGetByIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetByIdGet(params: HumanResourceGetByIdGet$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.humanResourceGetByIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceUpdatePut()` */
  static readonly HumanResourceUpdatePutPath = '/api/humanresource/{employeeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceUpdatePut()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  humanResourceUpdatePut$Response(params: HumanResourceUpdatePut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return humanResourceUpdatePut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceUpdatePut$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  humanResourceUpdatePut(params: HumanResourceUpdatePut$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.humanResourceUpdatePut$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceDeleteDelete()` */
  static readonly HumanResourceDeleteDeletePath = '/api/humanresource/{employeeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceDeleteDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceDeleteDelete$Response(params: HumanResourceDeleteDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return humanResourceDeleteDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceDeleteDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceDeleteDelete(params: HumanResourceDeleteDelete$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.humanResourceDeleteDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceGetByUserIdGet()` */
  static readonly HumanResourceGetByUserIdGetPath = '/api/humanresource/user/{userId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceGetByUserIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetByUserIdGet$Response(params: HumanResourceGetByUserIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return humanResourceGetByUserIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceGetByUserIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceGetByUserIdGet(params: HumanResourceGetByUserIdGet$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.humanResourceGetByUserIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceCheckDuplicateGet()` */
  static readonly HumanResourceCheckDuplicateGetPath = '/api/humanresource/check-duplicate';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceCheckDuplicateGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceCheckDuplicateGet$Response(params?: HumanResourceCheckDuplicateGet$Params, context?: HttpContext): Observable<StrictHttpResponse<BooleanBaseResponseModel>> {
    return humanResourceCheckDuplicateGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceCheckDuplicateGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceCheckDuplicateGet(params?: HumanResourceCheckDuplicateGet$Params, context?: HttpContext): Observable<BooleanBaseResponseModel> {
    return this.humanResourceCheckDuplicateGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<BooleanBaseResponseModel>): BooleanBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceCreateUserAccountPost()` */
  static readonly HumanResourceCreateUserAccountPostPath = '/api/humanresource/{employeeId}/create-user';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceCreateUserAccountPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceCreateUserAccountPost$Response(params: HumanResourceCreateUserAccountPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CreateUserAccountResponseModelBaseResponseModel>> {
    return humanResourceCreateUserAccountPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceCreateUserAccountPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceCreateUserAccountPost(params: HumanResourceCreateUserAccountPost$Params, context?: HttpContext): Observable<CreateUserAccountResponseModelBaseResponseModel> {
    return this.humanResourceCreateUserAccountPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<CreateUserAccountResponseModelBaseResponseModel>): CreateUserAccountResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceCreateAddressPost()` */
  static readonly HumanResourceCreateAddressPostPath = '/api/humanresource/{employeeId}/addresses';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceCreateAddressPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceCreateAddressPost$Response(params: HumanResourceCreateAddressPost$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeAddressResponseModelBaseResponseModel>> {
    return humanResourceCreateAddressPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceCreateAddressPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceCreateAddressPost(params: HumanResourceCreateAddressPost$Params, context?: HttpContext): Observable<EmployeeAddressResponseModelBaseResponseModel> {
    return this.humanResourceCreateAddressPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeAddressResponseModelBaseResponseModel>): EmployeeAddressResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceUpdateAddressPut()` */
  static readonly HumanResourceUpdateAddressPutPath = '/api/humanresource/{employeeId}/addresses/{addressId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceUpdateAddressPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceUpdateAddressPut$Response(params: HumanResourceUpdateAddressPut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeAddressResponseModelBaseResponseModel>> {
    return humanResourceUpdateAddressPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceUpdateAddressPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceUpdateAddressPut(params: HumanResourceUpdateAddressPut$Params, context?: HttpContext): Observable<EmployeeAddressResponseModelBaseResponseModel> {
    return this.humanResourceUpdateAddressPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeAddressResponseModelBaseResponseModel>): EmployeeAddressResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceDeleteAddressDelete()` */
  static readonly HumanResourceDeleteAddressDeletePath = '/api/humanresource/{employeeId}/addresses/{addressId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceDeleteAddressDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceDeleteAddressDelete$Response(params: HumanResourceDeleteAddressDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return humanResourceDeleteAddressDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceDeleteAddressDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceDeleteAddressDelete(params: HumanResourceDeleteAddressDelete$Params, context?: HttpContext): Observable<void> {
    return this.humanResourceDeleteAddressDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `humanResourceCreateEducationPost()` */
  static readonly HumanResourceCreateEducationPostPath = '/api/humanresource/{employeeId}/educations';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceCreateEducationPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceCreateEducationPost$Response(params: HumanResourceCreateEducationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeEducationResponseModelBaseResponseModel>> {
    return humanResourceCreateEducationPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceCreateEducationPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceCreateEducationPost(params: HumanResourceCreateEducationPost$Params, context?: HttpContext): Observable<EmployeeEducationResponseModelBaseResponseModel> {
    return this.humanResourceCreateEducationPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeEducationResponseModelBaseResponseModel>): EmployeeEducationResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceUpdateEducationPut()` */
  static readonly HumanResourceUpdateEducationPutPath = '/api/humanresource/{employeeId}/educations/{educationId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceUpdateEducationPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceUpdateEducationPut$Response(params: HumanResourceUpdateEducationPut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeEducationResponseModelBaseResponseModel>> {
    return humanResourceUpdateEducationPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceUpdateEducationPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceUpdateEducationPut(params: HumanResourceUpdateEducationPut$Params, context?: HttpContext): Observable<EmployeeEducationResponseModelBaseResponseModel> {
    return this.humanResourceUpdateEducationPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeEducationResponseModelBaseResponseModel>): EmployeeEducationResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceDeleteEducationDelete()` */
  static readonly HumanResourceDeleteEducationDeletePath = '/api/humanresource/{employeeId}/educations/{educationId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceDeleteEducationDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceDeleteEducationDelete$Response(params: HumanResourceDeleteEducationDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return humanResourceDeleteEducationDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceDeleteEducationDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceDeleteEducationDelete(params: HumanResourceDeleteEducationDelete$Params, context?: HttpContext): Observable<void> {
    return this.humanResourceDeleteEducationDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `humanResourceCreateWorkHistoryPost()` */
  static readonly HumanResourceCreateWorkHistoryPostPath = '/api/humanresource/{employeeId}/work-histories';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceCreateWorkHistoryPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceCreateWorkHistoryPost$Response(params: HumanResourceCreateWorkHistoryPost$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeWorkHistoryResponseModelBaseResponseModel>> {
    return humanResourceCreateWorkHistoryPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceCreateWorkHistoryPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceCreateWorkHistoryPost(params: HumanResourceCreateWorkHistoryPost$Params, context?: HttpContext): Observable<EmployeeWorkHistoryResponseModelBaseResponseModel> {
    return this.humanResourceCreateWorkHistoryPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeWorkHistoryResponseModelBaseResponseModel>): EmployeeWorkHistoryResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceUpdateWorkHistoryPut()` */
  static readonly HumanResourceUpdateWorkHistoryPutPath = '/api/humanresource/{employeeId}/work-histories/{workHistoryId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceUpdateWorkHistoryPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceUpdateWorkHistoryPut$Response(params: HumanResourceUpdateWorkHistoryPut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeWorkHistoryResponseModelBaseResponseModel>> {
    return humanResourceUpdateWorkHistoryPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceUpdateWorkHistoryPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  humanResourceUpdateWorkHistoryPut(params: HumanResourceUpdateWorkHistoryPut$Params, context?: HttpContext): Observable<EmployeeWorkHistoryResponseModelBaseResponseModel> {
    return this.humanResourceUpdateWorkHistoryPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeWorkHistoryResponseModelBaseResponseModel>): EmployeeWorkHistoryResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `humanResourceDeleteWorkHistoryDelete()` */
  static readonly HumanResourceDeleteWorkHistoryDeletePath = '/api/humanresource/{employeeId}/work-histories/{workHistoryId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `humanResourceDeleteWorkHistoryDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceDeleteWorkHistoryDelete$Response(params: HumanResourceDeleteWorkHistoryDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return humanResourceDeleteWorkHistoryDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `humanResourceDeleteWorkHistoryDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  humanResourceDeleteWorkHistoryDelete(params: HumanResourceDeleteWorkHistoryDelete$Params, context?: HttpContext): Observable<void> {
    return this.humanResourceDeleteWorkHistoryDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
