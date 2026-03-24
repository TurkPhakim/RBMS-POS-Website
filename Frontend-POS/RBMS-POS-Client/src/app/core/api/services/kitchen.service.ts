/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { kitchenGetKitchenItemsGet } from '../fn/kitchen/kitchen-get-kitchen-items-get';
import { KitchenGetKitchenItemsGet$Params } from '../fn/kitchen/kitchen-get-kitchen-items-get';
import { kitchenMarkReadyPut } from '../fn/kitchen/kitchen-mark-ready-put';
import { KitchenMarkReadyPut$Params } from '../fn/kitchen/kitchen-mark-ready-put';
import { KitchenOrderModelListResponseModel } from '../models/kitchen-order-model-list-response-model';
import { kitchenStartPreparingPut } from '../fn/kitchen/kitchen-start-preparing-put';
import { KitchenStartPreparingPut$Params } from '../fn/kitchen/kitchen-start-preparing-put';

@Injectable({ providedIn: 'root' })
export class KitchenService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `kitchenGetKitchenItemsGet()` */
  static readonly KitchenGetKitchenItemsGetPath = '/api/kitchen/orders';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `kitchenGetKitchenItemsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  kitchenGetKitchenItemsGet$Response(params?: KitchenGetKitchenItemsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<KitchenOrderModelListResponseModel>> {
    return kitchenGetKitchenItemsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `kitchenGetKitchenItemsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  kitchenGetKitchenItemsGet(params?: KitchenGetKitchenItemsGet$Params, context?: HttpContext): Observable<KitchenOrderModelListResponseModel> {
    return this.kitchenGetKitchenItemsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<KitchenOrderModelListResponseModel>): KitchenOrderModelListResponseModel => r.body)
    );
  }

  /** Path part for operation `kitchenStartPreparingPut()` */
  static readonly KitchenStartPreparingPutPath = '/api/kitchen/items/prepare';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `kitchenStartPreparingPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  kitchenStartPreparingPut$Response(params?: KitchenStartPreparingPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return kitchenStartPreparingPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `kitchenStartPreparingPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  kitchenStartPreparingPut(params?: KitchenStartPreparingPut$Params, context?: HttpContext): Observable<void> {
    return this.kitchenStartPreparingPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `kitchenMarkReadyPut()` */
  static readonly KitchenMarkReadyPutPath = '/api/kitchen/items/ready';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `kitchenMarkReadyPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  kitchenMarkReadyPut$Response(params?: KitchenMarkReadyPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return kitchenMarkReadyPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `kitchenMarkReadyPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  kitchenMarkReadyPut(params?: KitchenMarkReadyPut$Params, context?: HttpContext): Observable<void> {
    return this.kitchenMarkReadyPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
