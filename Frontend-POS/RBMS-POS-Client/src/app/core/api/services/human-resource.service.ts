/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { apiHumanresourceEmployeeIdCreateUserPost } from '../fn/human-resource/api-humanresource-employee-id-create-user-post';
import { ApiHumanresourceEmployeeIdCreateUserPost$Params } from '../fn/human-resource/api-humanresource-employee-id-create-user-post';
import { apiHumanresourceEmployeeIdDelete } from '../fn/human-resource/api-humanresource-employee-id-delete';
import { ApiHumanresourceEmployeeIdDelete$Params } from '../fn/human-resource/api-humanresource-employee-id-delete';
import { apiHumanresourceEmployeeIdGet } from '../fn/human-resource/api-humanresource-employee-id-get';
import { ApiHumanresourceEmployeeIdGet$Params } from '../fn/human-resource/api-humanresource-employee-id-get';
import { apiHumanresourceEmployeeIdPut } from '../fn/human-resource/api-humanresource-employee-id-put';
import { ApiHumanresourceEmployeeIdPut$Params } from '../fn/human-resource/api-humanresource-employee-id-put';
import { apiHumanresourceGet } from '../fn/human-resource/api-humanresource-get';
import { ApiHumanresourceGet$Params } from '../fn/human-resource/api-humanresource-get';
import { apiHumanresourcePost } from '../fn/human-resource/api-humanresource-post';
import { ApiHumanresourcePost$Params } from '../fn/human-resource/api-humanresource-post';
import { apiHumanresourceSearchGet } from '../fn/human-resource/api-humanresource-search-get';
import { ApiHumanresourceSearchGet$Params } from '../fn/human-resource/api-humanresource-search-get';
import { apiHumanresourceStatusStatusGet } from '../fn/human-resource/api-humanresource-status-status-get';
import { ApiHumanresourceStatusStatusGet$Params } from '../fn/human-resource/api-humanresource-status-status-get';
import { apiHumanresourceUserUserIdGet } from '../fn/human-resource/api-humanresource-user-user-id-get';
import { ApiHumanresourceUserUserIdGet$Params } from '../fn/human-resource/api-humanresource-user-user-id-get';
import { CreateUserAccountResponseModelBaseResponseModel } from '../models/create-user-account-response-model-base-response-model';
import { EmployeeResponseModelBaseResponseModel } from '../models/employee-response-model-base-response-model';
import { EmployeeResponseModelListResponseModel } from '../models/employee-response-model-list-response-model';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';

@Injectable({ providedIn: 'root' })
export class HumanResourceService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `apiHumanresourceGet()` */
  static readonly ApiHumanresourceGetPath = '/api/humanresource';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiHumanresourceGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceGet$Response(params?: ApiHumanresourceGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelListResponseModel>> {
    return apiHumanresourceGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiHumanresourceGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceGet(params?: ApiHumanresourceGet$Params, context?: HttpContext): Observable<EmployeeResponseModelListResponseModel> {
    return this.apiHumanresourceGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelListResponseModel>): EmployeeResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `apiHumanresourcePost()` */
  static readonly ApiHumanresourcePostPath = '/api/humanresource';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiHumanresourcePost()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  apiHumanresourcePost$Response(params?: ApiHumanresourcePost$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return apiHumanresourcePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiHumanresourcePost$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  apiHumanresourcePost(params?: ApiHumanresourcePost$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.apiHumanresourcePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiHumanresourceEmployeeIdGet()` */
  static readonly ApiHumanresourceEmployeeIdGetPath = '/api/humanresource/{employeeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiHumanresourceEmployeeIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceEmployeeIdGet$Response(params: ApiHumanresourceEmployeeIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return apiHumanresourceEmployeeIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiHumanresourceEmployeeIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceEmployeeIdGet(params: ApiHumanresourceEmployeeIdGet$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.apiHumanresourceEmployeeIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiHumanresourceEmployeeIdPut()` */
  static readonly ApiHumanresourceEmployeeIdPutPath = '/api/humanresource/{employeeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiHumanresourceEmployeeIdPut()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  apiHumanresourceEmployeeIdPut$Response(params: ApiHumanresourceEmployeeIdPut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return apiHumanresourceEmployeeIdPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiHumanresourceEmployeeIdPut$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  apiHumanresourceEmployeeIdPut(params: ApiHumanresourceEmployeeIdPut$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.apiHumanresourceEmployeeIdPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiHumanresourceEmployeeIdDelete()` */
  static readonly ApiHumanresourceEmployeeIdDeletePath = '/api/humanresource/{employeeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiHumanresourceEmployeeIdDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceEmployeeIdDelete$Response(params: ApiHumanresourceEmployeeIdDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return apiHumanresourceEmployeeIdDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiHumanresourceEmployeeIdDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceEmployeeIdDelete(params: ApiHumanresourceEmployeeIdDelete$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.apiHumanresourceEmployeeIdDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiHumanresourceStatusStatusGet()` */
  static readonly ApiHumanresourceStatusStatusGetPath = '/api/humanresource/status/{status}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiHumanresourceStatusStatusGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceStatusStatusGet$Response(params: ApiHumanresourceStatusStatusGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelListResponseModel>> {
    return apiHumanresourceStatusStatusGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiHumanresourceStatusStatusGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceStatusStatusGet(params: ApiHumanresourceStatusStatusGet$Params, context?: HttpContext): Observable<EmployeeResponseModelListResponseModel> {
    return this.apiHumanresourceStatusStatusGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelListResponseModel>): EmployeeResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `apiHumanresourceUserUserIdGet()` */
  static readonly ApiHumanresourceUserUserIdGetPath = '/api/humanresource/user/{userId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiHumanresourceUserUserIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceUserUserIdGet$Response(params: ApiHumanresourceUserUserIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
    return apiHumanresourceUserUserIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiHumanresourceUserUserIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceUserUserIdGet(params: ApiHumanresourceUserUserIdGet$Params, context?: HttpContext): Observable<EmployeeResponseModelBaseResponseModel> {
    return this.apiHumanresourceUserUserIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelBaseResponseModel>): EmployeeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiHumanresourceSearchGet()` */
  static readonly ApiHumanresourceSearchGetPath = '/api/humanresource/search';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiHumanresourceSearchGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceSearchGet$Response(params?: ApiHumanresourceSearchGet$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelListResponseModel>> {
    return apiHumanresourceSearchGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiHumanresourceSearchGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceSearchGet(params?: ApiHumanresourceSearchGet$Params, context?: HttpContext): Observable<EmployeeResponseModelListResponseModel> {
    return this.apiHumanresourceSearchGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<EmployeeResponseModelListResponseModel>): EmployeeResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `apiHumanresourceEmployeeIdCreateUserPost()` */
  static readonly ApiHumanresourceEmployeeIdCreateUserPostPath = '/api/humanresource/{employeeId}/create-user';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiHumanresourceEmployeeIdCreateUserPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceEmployeeIdCreateUserPost$Response(params: ApiHumanresourceEmployeeIdCreateUserPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CreateUserAccountResponseModelBaseResponseModel>> {
    return apiHumanresourceEmployeeIdCreateUserPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiHumanresourceEmployeeIdCreateUserPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiHumanresourceEmployeeIdCreateUserPost(params: ApiHumanresourceEmployeeIdCreateUserPost$Params, context?: HttpContext): Observable<CreateUserAccountResponseModelBaseResponseModel> {
    return this.apiHumanresourceEmployeeIdCreateUserPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<CreateUserAccountResponseModelBaseResponseModel>): CreateUserAccountResponseModelBaseResponseModel => r.body)
    );
  }

}
