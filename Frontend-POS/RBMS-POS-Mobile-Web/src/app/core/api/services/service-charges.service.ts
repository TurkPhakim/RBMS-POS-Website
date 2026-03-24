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
import { ServiceChargeDropdownModelListResponseModel } from '../models/service-charge-dropdown-model-list-response-model';
import { ServiceChargeResponseModelBaseResponseModel } from '../models/service-charge-response-model-base-response-model';
import { ServiceChargeResponseModelPaginationResult } from '../models/service-charge-response-model-pagination-result';
import { serviceChargesCreatePost } from '../fn/service-charges/service-charges-create-post';
import { ServiceChargesCreatePost$Params } from '../fn/service-charges/service-charges-create-post';
import { serviceChargesDeleteDelete } from '../fn/service-charges/service-charges-delete-delete';
import { ServiceChargesDeleteDelete$Params } from '../fn/service-charges/service-charges-delete-delete';
import { serviceChargesGetAllGet } from '../fn/service-charges/service-charges-get-all-get';
import { ServiceChargesGetAllGet$Params } from '../fn/service-charges/service-charges-get-all-get';
import { serviceChargesGetByIdGet } from '../fn/service-charges/service-charges-get-by-id-get';
import { ServiceChargesGetByIdGet$Params } from '../fn/service-charges/service-charges-get-by-id-get';
import { serviceChargesGetDropdownListGet } from '../fn/service-charges/service-charges-get-dropdown-list-get';
import { ServiceChargesGetDropdownListGet$Params } from '../fn/service-charges/service-charges-get-dropdown-list-get';
import { serviceChargesUpdatePut } from '../fn/service-charges/service-charges-update-put';
import { ServiceChargesUpdatePut$Params } from '../fn/service-charges/service-charges-update-put';

@Injectable({ providedIn: 'root' })
export class ServiceChargesService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `serviceChargesGetAllGet()` */
  static readonly ServiceChargesGetAllGetPath = '/api/admin/servicecharges';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `serviceChargesGetAllGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  serviceChargesGetAllGet$Response(params?: ServiceChargesGetAllGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelPaginationResult>> {
    return serviceChargesGetAllGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `serviceChargesGetAllGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  serviceChargesGetAllGet(params?: ServiceChargesGetAllGet$Params, context?: HttpContext): Observable<ServiceChargeResponseModelPaginationResult> {
    return this.serviceChargesGetAllGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeResponseModelPaginationResult>): ServiceChargeResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `serviceChargesCreatePost()` */
  static readonly ServiceChargesCreatePostPath = '/api/admin/servicecharges';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `serviceChargesCreatePost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  serviceChargesCreatePost$Response(params?: ServiceChargesCreatePost$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>> {
    return serviceChargesCreatePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `serviceChargesCreatePost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  serviceChargesCreatePost(params?: ServiceChargesCreatePost$Params, context?: HttpContext): Observable<ServiceChargeResponseModelBaseResponseModel> {
    return this.serviceChargesCreatePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>): ServiceChargeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `serviceChargesGetByIdGet()` */
  static readonly ServiceChargesGetByIdGetPath = '/api/admin/servicecharges/{serviceChargeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `serviceChargesGetByIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  serviceChargesGetByIdGet$Response(params: ServiceChargesGetByIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>> {
    return serviceChargesGetByIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `serviceChargesGetByIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  serviceChargesGetByIdGet(params: ServiceChargesGetByIdGet$Params, context?: HttpContext): Observable<ServiceChargeResponseModelBaseResponseModel> {
    return this.serviceChargesGetByIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>): ServiceChargeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `serviceChargesUpdatePut()` */
  static readonly ServiceChargesUpdatePutPath = '/api/admin/servicecharges/{serviceChargeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `serviceChargesUpdatePut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  serviceChargesUpdatePut$Response(params: ServiceChargesUpdatePut$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>> {
    return serviceChargesUpdatePut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `serviceChargesUpdatePut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  serviceChargesUpdatePut(params: ServiceChargesUpdatePut$Params, context?: HttpContext): Observable<ServiceChargeResponseModelBaseResponseModel> {
    return this.serviceChargesUpdatePut$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeResponseModelBaseResponseModel>): ServiceChargeResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `serviceChargesDeleteDelete()` */
  static readonly ServiceChargesDeleteDeletePath = '/api/admin/servicecharges/{serviceChargeId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `serviceChargesDeleteDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  serviceChargesDeleteDelete$Response(params: ServiceChargesDeleteDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return serviceChargesDeleteDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `serviceChargesDeleteDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  serviceChargesDeleteDelete(params: ServiceChargesDeleteDelete$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.serviceChargesDeleteDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `serviceChargesGetDropdownListGet()` */
  static readonly ServiceChargesGetDropdownListGetPath = '/api/admin/servicecharges/dropdown';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `serviceChargesGetDropdownListGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  serviceChargesGetDropdownListGet$Response(params?: ServiceChargesGetDropdownListGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ServiceChargeDropdownModelListResponseModel>> {
    return serviceChargesGetDropdownListGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `serviceChargesGetDropdownListGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  serviceChargesGetDropdownListGet(params?: ServiceChargesGetDropdownListGet$Params, context?: HttpContext): Observable<ServiceChargeDropdownModelListResponseModel> {
    return this.serviceChargesGetDropdownListGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ServiceChargeDropdownModelListResponseModel>): ServiceChargeDropdownModelListResponseModel => r.body)
    );
  }

}
