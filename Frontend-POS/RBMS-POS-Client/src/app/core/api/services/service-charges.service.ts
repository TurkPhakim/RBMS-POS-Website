/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { apiAdminServicechargesDropdownGet } from '../fn/service-charges/api-admin-servicecharges-dropdown-get';
import { ApiAdminServicechargesDropdownGet$Params } from '../fn/service-charges/api-admin-servicecharges-dropdown-get';
import { apiAdminServicechargesGet } from '../fn/service-charges/api-admin-servicecharges-get';
import { ApiAdminServicechargesGet$Params } from '../fn/service-charges/api-admin-servicecharges-get';
import { apiAdminServicechargesPost } from '../fn/service-charges/api-admin-servicecharges-post';
import { ApiAdminServicechargesPost$Params } from '../fn/service-charges/api-admin-servicecharges-post';
import { apiAdminServicechargesServiceChargeIdDelete } from '../fn/service-charges/api-admin-servicecharges-service-charge-id-delete';
import { ApiAdminServicechargesServiceChargeIdDelete$Params } from '../fn/service-charges/api-admin-servicecharges-service-charge-id-delete';
import { apiAdminServicechargesServiceChargeIdGet } from '../fn/service-charges/api-admin-servicecharges-service-charge-id-get';
import { ApiAdminServicechargesServiceChargeIdGet$Params } from '../fn/service-charges/api-admin-servicecharges-service-charge-id-get';
import { apiAdminServicechargesServiceChargeIdPut } from '../fn/service-charges/api-admin-servicecharges-service-charge-id-put';
import { ApiAdminServicechargesServiceChargeIdPut$Params } from '../fn/service-charges/api-admin-servicecharges-service-charge-id-put';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';
import { ServiceChargeDropdownModelListResponseModel } from '../models/service-charge-dropdown-model-list-response-model';
import { ServiceChargeResponseModelBaseResponseModel } from '../models/service-charge-response-model-base-response-model';
import { ServiceChargeResponseModelListResponseModel } from '../models/service-charge-response-model-list-response-model';

@Injectable({ providedIn: 'root' })
export class ServiceChargesService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `apiAdminServicechargesGet()` */
  static readonly ApiAdminServicechargesGetPath = '/api/admin/servicecharges';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminServicechargesGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminServicechargesGet$Response(params?: ApiAdminServicechargesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelListResponseModel>> {
    return apiAdminServicechargesGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminServicechargesGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminServicechargesGet(params?: ApiAdminServicechargesGet$Params, context?: HttpContext): Observable<ServiceChargeResponseModelListResponseModel> {
    return this.apiAdminServicechargesGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeResponseModelListResponseModel>): ServiceChargeResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminServicechargesPost()` */
  static readonly ApiAdminServicechargesPostPath = '/api/admin/servicecharges';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminServicechargesPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminServicechargesPost$Response(params?: ApiAdminServicechargesPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>> {
    return apiAdminServicechargesPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminServicechargesPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminServicechargesPost(params?: ApiAdminServicechargesPost$Params, context?: HttpContext): Observable<ServiceChargeResponseModelBaseResponseModel> {
    return this.apiAdminServicechargesPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>): ServiceChargeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminServicechargesServiceChargeIdGet()` */
  static readonly ApiAdminServicechargesServiceChargeIdGetPath = '/api/admin/servicecharges/{serviceChargeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminServicechargesServiceChargeIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminServicechargesServiceChargeIdGet$Response(params: ApiAdminServicechargesServiceChargeIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>> {
    return apiAdminServicechargesServiceChargeIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminServicechargesServiceChargeIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminServicechargesServiceChargeIdGet(params: ApiAdminServicechargesServiceChargeIdGet$Params, context?: HttpContext): Observable<ServiceChargeResponseModelBaseResponseModel> {
    return this.apiAdminServicechargesServiceChargeIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>): ServiceChargeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminServicechargesServiceChargeIdPut()` */
  static readonly ApiAdminServicechargesServiceChargeIdPutPath = '/api/admin/servicecharges/{serviceChargeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminServicechargesServiceChargeIdPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminServicechargesServiceChargeIdPut$Response(params: ApiAdminServicechargesServiceChargeIdPut$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>> {
    return apiAdminServicechargesServiceChargeIdPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminServicechargesServiceChargeIdPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  apiAdminServicechargesServiceChargeIdPut(params: ApiAdminServicechargesServiceChargeIdPut$Params, context?: HttpContext): Observable<ServiceChargeResponseModelBaseResponseModel> {
    return this.apiAdminServicechargesServiceChargeIdPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>): ServiceChargeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminServicechargesServiceChargeIdDelete()` */
  static readonly ApiAdminServicechargesServiceChargeIdDeletePath = '/api/admin/servicecharges/{serviceChargeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminServicechargesServiceChargeIdDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminServicechargesServiceChargeIdDelete$Response(params: ApiAdminServicechargesServiceChargeIdDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return apiAdminServicechargesServiceChargeIdDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminServicechargesServiceChargeIdDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminServicechargesServiceChargeIdDelete(params: ApiAdminServicechargesServiceChargeIdDelete$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.apiAdminServicechargesServiceChargeIdDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `apiAdminServicechargesDropdownGet()` */
  static readonly ApiAdminServicechargesDropdownGetPath = '/api/admin/servicecharges/dropdown';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminServicechargesDropdownGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminServicechargesDropdownGet$Response(params?: ApiAdminServicechargesDropdownGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeDropdownModelListResponseModel>> {
    return apiAdminServicechargesDropdownGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminServicechargesDropdownGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminServicechargesDropdownGet(params?: ApiAdminServicechargesDropdownGet$Params, context?: HttpContext): Observable<ServiceChargeDropdownModelListResponseModel> {
    return this.apiAdminServicechargesDropdownGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeDropdownModelListResponseModel>): ServiceChargeDropdownModelListResponseModel => r.body)
    );
  }

}
