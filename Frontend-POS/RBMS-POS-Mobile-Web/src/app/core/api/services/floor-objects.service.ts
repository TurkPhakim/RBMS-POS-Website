/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { FloorObjectResponseModelBaseResponseModel } from '../models/floor-object-response-model-base-response-model';
import { FloorObjectResponseModelListResponseModel } from '../models/floor-object-response-model-list-response-model';
import { floorObjectsCreateFloorObjectPost } from '../fn/floor-objects/floor-objects-create-floor-object-post';
import { FloorObjectsCreateFloorObjectPost$Params } from '../fn/floor-objects/floor-objects-create-floor-object-post';
import { floorObjectsDeleteFloorObjectDelete } from '../fn/floor-objects/floor-objects-delete-floor-object-delete';
import { FloorObjectsDeleteFloorObjectDelete$Params } from '../fn/floor-objects/floor-objects-delete-floor-object-delete';
import { floorObjectsGetFloorObjectsGet } from '../fn/floor-objects/floor-objects-get-floor-objects-get';
import { FloorObjectsGetFloorObjectsGet$Params } from '../fn/floor-objects/floor-objects-get-floor-objects-get';
import { floorObjectsUpdateFloorObjectPut } from '../fn/floor-objects/floor-objects-update-floor-object-put';
import { FloorObjectsUpdateFloorObjectPut$Params } from '../fn/floor-objects/floor-objects-update-floor-object-put';
import { floorObjectsUpdatePositionsPut } from '../fn/floor-objects/floor-objects-update-positions-put';
import { FloorObjectsUpdatePositionsPut$Params } from '../fn/floor-objects/floor-objects-update-positions-put';

@Injectable({ providedIn: 'root' })
export class FloorObjectsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `floorObjectsGetFloorObjectsGet()` */
  static readonly FloorObjectsGetFloorObjectsGetPath = '/api/table/floor-objects';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `floorObjectsGetFloorObjectsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  floorObjectsGetFloorObjectsGet$Response(params?: FloorObjectsGetFloorObjectsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<FloorObjectResponseModelListResponseModel>> {
    return floorObjectsGetFloorObjectsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `floorObjectsGetFloorObjectsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  floorObjectsGetFloorObjectsGet(params?: FloorObjectsGetFloorObjectsGet$Params, context?: HttpContext): Observable<FloorObjectResponseModelListResponseModel> {
    return this.floorObjectsGetFloorObjectsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<FloorObjectResponseModelListResponseModel>): FloorObjectResponseModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `floorObjectsCreateFloorObjectPost()` */
  static readonly FloorObjectsCreateFloorObjectPostPath = '/api/table/floor-objects';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `floorObjectsCreateFloorObjectPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  floorObjectsCreateFloorObjectPost$Response(params?: FloorObjectsCreateFloorObjectPost$Params, context?: HttpContext): Observable<StrictHttpResponse<FloorObjectResponseModelBaseResponseModel>> {
    return floorObjectsCreateFloorObjectPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `floorObjectsCreateFloorObjectPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  floorObjectsCreateFloorObjectPost(params?: FloorObjectsCreateFloorObjectPost$Params, context?: HttpContext): Observable<FloorObjectResponseModelBaseResponseModel> {
    return this.floorObjectsCreateFloorObjectPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<FloorObjectResponseModelBaseResponseModel>): FloorObjectResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `floorObjectsUpdateFloorObjectPut()` */
  static readonly FloorObjectsUpdateFloorObjectPutPath = '/api/table/floor-objects/{floorObjectId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `floorObjectsUpdateFloorObjectPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  floorObjectsUpdateFloorObjectPut$Response(params: FloorObjectsUpdateFloorObjectPut$Params, context?: HttpContext): Observable<StrictHttpResponse<FloorObjectResponseModelBaseResponseModel>> {
    return floorObjectsUpdateFloorObjectPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `floorObjectsUpdateFloorObjectPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  floorObjectsUpdateFloorObjectPut(params: FloorObjectsUpdateFloorObjectPut$Params, context?: HttpContext): Observable<FloorObjectResponseModelBaseResponseModel> {
    return this.floorObjectsUpdateFloorObjectPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<FloorObjectResponseModelBaseResponseModel>): FloorObjectResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `floorObjectsDeleteFloorObjectDelete()` */
  static readonly FloorObjectsDeleteFloorObjectDeletePath = '/api/table/floor-objects/{floorObjectId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `floorObjectsDeleteFloorObjectDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  floorObjectsDeleteFloorObjectDelete$Response(params: FloorObjectsDeleteFloorObjectDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return floorObjectsDeleteFloorObjectDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `floorObjectsDeleteFloorObjectDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  floorObjectsDeleteFloorObjectDelete(params: FloorObjectsDeleteFloorObjectDelete$Params, context?: HttpContext): Observable<void> {
    return this.floorObjectsDeleteFloorObjectDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `floorObjectsUpdatePositionsPut()` */
  static readonly FloorObjectsUpdatePositionsPutPath = '/api/table/floor-objects/positions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `floorObjectsUpdatePositionsPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  floorObjectsUpdatePositionsPut$Response(params?: FloorObjectsUpdatePositionsPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return floorObjectsUpdatePositionsPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `floorObjectsUpdatePositionsPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  floorObjectsUpdatePositionsPut(params?: FloorObjectsUpdatePositionsPut$Params, context?: HttpContext): Observable<void> {
    return this.floorObjectsUpdatePositionsPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
