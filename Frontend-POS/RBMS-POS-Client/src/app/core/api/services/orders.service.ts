/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { OrderBillResponseModelBaseResponseModel } from '../models/order-bill-response-model-base-response-model';
import { OrderBillResponseModelListBaseResponseModel } from '../models/order-bill-response-model-list-base-response-model';
import { OrderDetailResponseModelBaseResponseModel } from '../models/order-detail-response-model-base-response-model';
import { OrderResponseModelPaginationResult } from '../models/order-response-model-pagination-result';
import { ordersAddItemsPost } from '../fn/orders/orders-add-items-post';
import { OrdersAddItemsPost$Params } from '../fn/orders/orders-add-items-post';
import { ordersCancelItemPut } from '../fn/orders/orders-cancel-item-put';
import { OrdersCancelItemPut$Params } from '../fn/orders/orders-cancel-item-put';
import { ordersCreateOrderPost } from '../fn/orders/orders-create-order-post';
import { OrdersCreateOrderPost$Params } from '../fn/orders/orders-create-order-post';
import { ordersGetActiveOrderByTableGet } from '../fn/orders/orders-get-active-order-by-table-get';
import { OrdersGetActiveOrderByTableGet$Params } from '../fn/orders/orders-get-active-order-by-table-get';
import { ordersGetBillsGet } from '../fn/orders/orders-get-bills-get';
import { OrdersGetBillsGet$Params } from '../fn/orders/orders-get-bills-get';
import { ordersGetOrderGet } from '../fn/orders/orders-get-order-get';
import { OrdersGetOrderGet$Params } from '../fn/orders/orders-get-order-get';
import { ordersGetOrdersGet } from '../fn/orders/orders-get-orders-get';
import { OrdersGetOrdersGet$Params } from '../fn/orders/orders-get-orders-get';
import { ordersRequestBillPost } from '../fn/orders/orders-request-bill-post';
import { OrdersRequestBillPost$Params } from '../fn/orders/orders-request-bill-post';
import { ordersSendToKitchenPost } from '../fn/orders/orders-send-to-kitchen-post';
import { OrdersSendToKitchenPost$Params } from '../fn/orders/orders-send-to-kitchen-post';
import { ordersServeItemPut } from '../fn/orders/orders-serve-item-put';
import { OrdersServeItemPut$Params } from '../fn/orders/orders-serve-item-put';
import { ordersSplitByAmountPost } from '../fn/orders/orders-split-by-amount-post';
import { OrdersSplitByAmountPost$Params } from '../fn/orders/orders-split-by-amount-post';
import { ordersSplitByItemPost } from '../fn/orders/orders-split-by-item-post';
import { OrdersSplitByItemPost$Params } from '../fn/orders/orders-split-by-item-post';
import { ordersUpdateBillChargesPut } from '../fn/orders/orders-update-bill-charges-put';
import { OrdersUpdateBillChargesPut$Params } from '../fn/orders/orders-update-bill-charges-put';
import { ordersVoidBillPost } from '../fn/orders/orders-void-bill-post';
import { OrdersVoidBillPost$Params } from '../fn/orders/orders-void-bill-post';
import { ordersVoidItemPut } from '../fn/orders/orders-void-item-put';
import { OrdersVoidItemPut$Params } from '../fn/orders/orders-void-item-put';

@Injectable({ providedIn: 'root' })
export class OrdersService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `ordersGetOrdersGet()` */
  static readonly OrdersGetOrdersGetPath = '/api/order/orders';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersGetOrdersGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersGetOrdersGet$Response(params?: OrdersGetOrdersGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderResponseModelPaginationResult>> {
    return ordersGetOrdersGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersGetOrdersGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersGetOrdersGet(params?: OrdersGetOrdersGet$Params, context?: HttpContext): Observable<OrderResponseModelPaginationResult> {
    return this.ordersGetOrdersGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderResponseModelPaginationResult>): OrderResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `ordersCreateOrderPost()` */
  static readonly OrdersCreateOrderPostPath = '/api/order/orders';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersCreateOrderPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersCreateOrderPost$Response(params?: OrdersCreateOrderPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
    return ordersCreateOrderPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersCreateOrderPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersCreateOrderPost(params?: OrdersCreateOrderPost$Params, context?: HttpContext): Observable<OrderDetailResponseModelBaseResponseModel> {
    return this.ordersCreateOrderPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>): OrderDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersGetOrderGet()` */
  static readonly OrdersGetOrderGetPath = '/api/order/orders/{orderId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersGetOrderGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersGetOrderGet$Response(params: OrdersGetOrderGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
    return ordersGetOrderGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersGetOrderGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersGetOrderGet(params: OrdersGetOrderGet$Params, context?: HttpContext): Observable<OrderDetailResponseModelBaseResponseModel> {
    return this.ordersGetOrderGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>): OrderDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersGetActiveOrderByTableGet()` */
  static readonly OrdersGetActiveOrderByTableGetPath = '/api/order/orders/table/{tableId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersGetActiveOrderByTableGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersGetActiveOrderByTableGet$Response(params: OrdersGetActiveOrderByTableGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
    return ordersGetActiveOrderByTableGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersGetActiveOrderByTableGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersGetActiveOrderByTableGet(params: OrdersGetActiveOrderByTableGet$Params, context?: HttpContext): Observable<OrderDetailResponseModelBaseResponseModel> {
    return this.ordersGetActiveOrderByTableGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>): OrderDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersAddItemsPost()` */
  static readonly OrdersAddItemsPostPath = '/api/order/orders/{orderId}/items';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersAddItemsPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersAddItemsPost$Response(params: OrdersAddItemsPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
    return ordersAddItemsPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersAddItemsPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersAddItemsPost(params: OrdersAddItemsPost$Params, context?: HttpContext): Observable<OrderDetailResponseModelBaseResponseModel> {
    return this.ordersAddItemsPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>): OrderDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersSendToKitchenPost()` */
  static readonly OrdersSendToKitchenPostPath = '/api/order/orders/{orderId}/send-kitchen';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersSendToKitchenPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersSendToKitchenPost$Response(params: OrdersSendToKitchenPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
    return ordersSendToKitchenPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersSendToKitchenPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersSendToKitchenPost(params: OrdersSendToKitchenPost$Params, context?: HttpContext): Observable<OrderDetailResponseModelBaseResponseModel> {
    return this.ordersSendToKitchenPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>): OrderDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersRequestBillPost()` */
  static readonly OrdersRequestBillPostPath = '/api/order/orders/{orderId}/request-bill';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersRequestBillPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersRequestBillPost$Response(params: OrdersRequestBillPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
    return ordersRequestBillPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersRequestBillPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersRequestBillPost(params: OrdersRequestBillPost$Params, context?: HttpContext): Observable<OrderDetailResponseModelBaseResponseModel> {
    return this.ordersRequestBillPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>): OrderDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersVoidBillPost()` */
  static readonly OrdersVoidBillPostPath = '/api/order/orders/{orderId}/void-bill';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersVoidBillPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersVoidBillPost$Response(params: OrdersVoidBillPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>> {
    return ordersVoidBillPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersVoidBillPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersVoidBillPost(params: OrdersVoidBillPost$Params, context?: HttpContext): Observable<OrderDetailResponseModelBaseResponseModel> {
    return this.ordersVoidBillPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderDetailResponseModelBaseResponseModel>): OrderDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersVoidItemPut()` */
  static readonly OrdersVoidItemPutPath = '/api/order/orders/items/{orderItemId}/void';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersVoidItemPut()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersVoidItemPut$Response(params: OrdersVoidItemPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return ordersVoidItemPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersVoidItemPut$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersVoidItemPut(params: OrdersVoidItemPut$Params, context?: HttpContext): Observable<void> {
    return this.ordersVoidItemPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `ordersCancelItemPut()` */
  static readonly OrdersCancelItemPutPath = '/api/order/orders/items/{orderItemId}/cancel';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersCancelItemPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersCancelItemPut$Response(params: OrdersCancelItemPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return ordersCancelItemPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersCancelItemPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersCancelItemPut(params: OrdersCancelItemPut$Params, context?: HttpContext): Observable<void> {
    return this.ordersCancelItemPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `ordersServeItemPut()` */
  static readonly OrdersServeItemPutPath = '/api/order/orders/items/{orderItemId}/serve';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersServeItemPut()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersServeItemPut$Response(params: OrdersServeItemPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return ordersServeItemPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersServeItemPut$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersServeItemPut(params: OrdersServeItemPut$Params, context?: HttpContext): Observable<void> {
    return this.ordersServeItemPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `ordersSplitByItemPost()` */
  static readonly OrdersSplitByItemPostPath = '/api/order/orders/{orderId}/split/by-item';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersSplitByItemPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersSplitByItemPost$Response(params: OrdersSplitByItemPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>> {
    return ordersSplitByItemPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersSplitByItemPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersSplitByItemPost(params: OrdersSplitByItemPost$Params, context?: HttpContext): Observable<OrderBillResponseModelListBaseResponseModel> {
    return this.ordersSplitByItemPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>): OrderBillResponseModelListBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersSplitByAmountPost()` */
  static readonly OrdersSplitByAmountPostPath = '/api/order/orders/{orderId}/split/by-amount';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersSplitByAmountPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersSplitByAmountPost$Response(params: OrdersSplitByAmountPost$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>> {
    return ordersSplitByAmountPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersSplitByAmountPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersSplitByAmountPost(params: OrdersSplitByAmountPost$Params, context?: HttpContext): Observable<OrderBillResponseModelListBaseResponseModel> {
    return this.ordersSplitByAmountPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>): OrderBillResponseModelListBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersGetBillsGet()` */
  static readonly OrdersGetBillsGetPath = '/api/order/orders/{orderId}/bills';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersGetBillsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersGetBillsGet$Response(params: OrdersGetBillsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>> {
    return ordersGetBillsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersGetBillsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersGetBillsGet(params: OrdersGetBillsGet$Params, context?: HttpContext): Observable<OrderBillResponseModelListBaseResponseModel> {
    return this.ordersGetBillsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderBillResponseModelListBaseResponseModel>): OrderBillResponseModelListBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `ordersUpdateBillChargesPut()` */
  static readonly OrdersUpdateBillChargesPutPath = '/api/order/orders/bills/{orderBillId}/update-charges';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersUpdateBillChargesPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersUpdateBillChargesPut$Response(params: OrdersUpdateBillChargesPut$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderBillResponseModelBaseResponseModel>> {
    return ordersUpdateBillChargesPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ordersUpdateBillChargesPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  ordersUpdateBillChargesPut(params: OrdersUpdateBillChargesPut$Params, context?: HttpContext): Observable<OrderBillResponseModelBaseResponseModel> {
    return this.ordersUpdateBillChargesPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrderBillResponseModelBaseResponseModel>): OrderBillResponseModelBaseResponseModel => r.body)
    );
  }

}
