/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ZoneResponseModelBaseResponseModel } from '../models/zone-response-model-base-response-model';
import { ZoneResponseModelListResponseModel } from '../models/zone-response-model-list-response-model';
import { ZoneResponseModelPaginationResult } from '../models/zone-response-model-pagination-result';
import { zonesCreateZonePost } from '../fn/zones/zones-create-zone-post';
import { ZonesCreateZonePost$Params } from '../fn/zones/zones-create-zone-post';
import { zonesDeleteZoneDelete } from '../fn/zones/zones-delete-zone-delete';
import { ZonesDeleteZoneDelete$Params } from '../fn/zones/zones-delete-zone-delete';
import { zonesGetActiveZonesGet } from '../fn/zones/zones-get-active-zones-get';
import { ZonesGetActiveZonesGet$Params } from '../fn/zones/zones-get-active-zones-get';
import { zonesGetZoneGet } from '../fn/zones/zones-get-zone-get';
import { ZonesGetZoneGet$Params } from '../fn/zones/zones-get-zone-get';
import { zonesGetZonesGet } from '../fn/zones/zones-get-zones-get';
import { ZonesGetZonesGet$Params } from '../fn/zones/zones-get-zones-get';
import { zonesUpdateSortOrderPut } from '../fn/zones/zones-update-sort-order-put';
import { ZonesUpdateSortOrderPut$Params } from '../fn/zones/zones-update-sort-order-put';
import { zonesUpdateZonePut } from '../fn/zones/zones-update-zone-put';
import { ZonesUpdateZonePut$Params } from '../fn/zones/zones-update-zone-put';

@Injectable({ providedIn: 'root' })
export class ZonesService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `zonesGetZonesGet()` */
  static readonly ZonesGetZonesGetPath = '/api/table/zones';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `zonesGetZonesGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  zonesGetZonesGet$Response(params?: ZonesGetZonesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ZoneResponseModelPaginationResult>> {
    return zonesGetZonesGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `zonesGetZonesGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  zonesGetZonesGet(params?: ZonesGetZonesGet$Params, context?: HttpContext): Observable<ZoneResponseModelPaginationResult> {
    return this.zonesGetZonesGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ZoneResponseModelPaginationResult>): ZoneResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `zonesCreateZonePost()` */
  static readonly ZonesCreateZonePostPath = '/api/table/zones';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `zonesCreateZonePost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  zonesCreateZonePost$Response(params?: ZonesCreateZonePost$Params, context?: HttpContext): Observable<StrictHttpResponse<ZoneResponseModelBaseResponseModel>> {
    return zonesCreateZonePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `zonesCreateZonePost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  zonesCreateZonePost(params?: ZonesCreateZonePost$Params, context?: HttpContext): Observable<ZoneResponseModelBaseResponseModel> {
    return this.zonesCreateZonePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ZoneResponseModelBaseResponseModel>): ZoneResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `zonesGetZoneGet()` */
  static readonly ZonesGetZoneGetPath = '/api/table/zones/{zoneId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `zonesGetZoneGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  zonesGetZoneGet$Response(params: ZonesGetZoneGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ZoneResponseModelBaseResponseModel>> {
    return zonesGetZoneGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `zonesGetZoneGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  zonesGetZoneGet(params: ZonesGetZoneGet$Params, context?: HttpContext): Observable<ZoneResponseModelBaseResponseModel> {
    return this.zonesGetZoneGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ZoneResponseModelBaseResponseModel>): ZoneResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `zonesUpdateZonePut()` */
  static readonly ZonesUpdateZonePutPath = '/api/table/zones/{zoneId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `zonesUpdateZonePut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  zonesUpdateZonePut$Response(params: ZonesUpdateZonePut$Params, context?: HttpContext): Observable<StrictHttpResponse<ZoneResponseModelBaseResponseModel>> {
    return zonesUpdateZonePut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `zonesUpdateZonePut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  zonesUpdateZonePut(params: ZonesUpdateZonePut$Params, context?: HttpContext): Observable<ZoneResponseModelBaseResponseModel> {
    return this.zonesUpdateZonePut$Response(params, context).pipe(
      map((r: StrictHttpResponse<ZoneResponseModelBaseResponseModel>): ZoneResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `zonesDeleteZoneDelete()` */
  static readonly ZonesDeleteZoneDeletePath = '/api/table/zones/{zoneId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `zonesDeleteZoneDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  zonesDeleteZoneDelete$Response(params: ZonesDeleteZoneDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return zonesDeleteZoneDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `zonesDeleteZoneDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  zonesDeleteZoneDelete(params: ZonesDeleteZoneDelete$Params, context?: HttpContext): Observable<void> {
    return this.zonesDeleteZoneDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `zonesGetActiveZonesGet()` */
  static readonly ZonesGetActiveZonesGetPath = '/api/table/zones/active';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `zonesGetActiveZonesGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  zonesGetActiveZonesGet$Response(params?: ZonesGetActiveZonesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ZoneResponseModelListResponseModel>> {
    return zonesGetActiveZonesGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `zonesGetActiveZonesGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  zonesGetActiveZonesGet(params?: ZonesGetActiveZonesGet$Params, context?: HttpContext): Observable<ZoneResponseModelListResponseModel> {
    return this.zonesGetActiveZonesGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ZoneResponseModelListResponseModel>): ZoneResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `zonesUpdateSortOrderPut()` */
  static readonly ZonesUpdateSortOrderPutPath = '/api/table/zones/sort-order';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `zonesUpdateSortOrderPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  zonesUpdateSortOrderPut$Response(params?: ZonesUpdateSortOrderPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return zonesUpdateSortOrderPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `zonesUpdateSortOrderPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  zonesUpdateSortOrderPut(params?: ZonesUpdateSortOrderPut$Params, context?: HttpContext): Observable<void> {
    return this.zonesUpdateSortOrderPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
