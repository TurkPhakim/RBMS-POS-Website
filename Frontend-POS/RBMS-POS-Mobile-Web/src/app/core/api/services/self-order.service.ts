/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { CustomerAuthResponseModelBaseResponseModel } from '../models/customer-auth-response-model-base-response-model';
import { CustomerMenuCategoriesResponseModelBaseResponseModel } from '../models/customer-menu-categories-response-model-base-response-model';
import { CustomerMenuDetailResponseModelBaseResponseModel } from '../models/customer-menu-detail-response-model-base-response-model';
import { CustomerMenuItemResponseModelListBaseResponseModel } from '../models/customer-menu-item-response-model-list-base-response-model';
import { CustomerOrderResponseModelBaseResponseModel } from '../models/customer-order-response-model-base-response-model';
import { CustomerOrderTrackingResponseModelBaseResponseModel } from '../models/customer-order-tracking-response-model-base-response-model';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';
import { ReceiptDataModelBaseResponseModel } from '../models/receipt-data-model-base-response-model';
import { selfOrderAuthenticatePost } from '../fn/self-order/self-order-authenticate-post';
import { SelfOrderAuthenticatePost$Params } from '../fn/self-order/self-order-authenticate-post';
import { selfOrderCallWaiterPost } from '../fn/self-order/self-order-call-waiter-post';
import { SelfOrderCallWaiterPost$Params } from '../fn/self-order/self-order-call-waiter-post';
import { selfOrderGetConsolidatedReceiptGet } from '../fn/self-order/self-order-get-consolidated-receipt-get';
import { SelfOrderGetConsolidatedReceiptGet$Params } from '../fn/self-order/self-order-get-consolidated-receipt-get';
import { selfOrderGetMenuCategoriesGet } from '../fn/self-order/self-order-get-menu-categories-get';
import { SelfOrderGetMenuCategoriesGet$Params } from '../fn/self-order/self-order-get-menu-categories-get';
import { selfOrderGetMenuDetailGet } from '../fn/self-order/self-order-get-menu-detail-get';
import { SelfOrderGetMenuDetailGet$Params } from '../fn/self-order/self-order-get-menu-detail-get';
import { selfOrderGetMenuItemsGet } from '../fn/self-order/self-order-get-menu-items-get';
import { SelfOrderGetMenuItemsGet$Params } from '../fn/self-order/self-order-get-menu-items-get';
import { selfOrderGetOrdersGet } from '../fn/self-order/self-order-get-orders-get';
import { SelfOrderGetOrdersGet$Params } from '../fn/self-order/self-order-get-orders-get';
import { selfOrderGetReceiptGet } from '../fn/self-order/self-order-get-receipt-get';
import { SelfOrderGetReceiptGet$Params } from '../fn/self-order/self-order-get-receipt-get';
import { selfOrderRequestBillPost } from '../fn/self-order/self-order-request-bill-post';
import { SelfOrderRequestBillPost$Params } from '../fn/self-order/self-order-request-bill-post';
import { selfOrderRequestCashPaymentPost } from '../fn/self-order/self-order-request-cash-payment-post';
import { SelfOrderRequestCashPaymentPost$Params } from '../fn/self-order/self-order-request-cash-payment-post';
import { selfOrderRequestSplitBillPost } from '../fn/self-order/self-order-request-split-bill-post';
import { SelfOrderRequestSplitBillPost$Params } from '../fn/self-order/self-order-request-split-bill-post';
import { selfOrderSetNicknamePost } from '../fn/self-order/self-order-set-nickname-post';
import { SelfOrderSetNicknamePost$Params } from '../fn/self-order/self-order-set-nickname-post';
import { selfOrderSubmitOrderPost } from '../fn/self-order/self-order-submit-order-post';
import { SelfOrderSubmitOrderPost$Params } from '../fn/self-order/self-order-submit-order-post';

@Injectable({ providedIn: 'root' })
export class SelfOrderService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `selfOrderAuthenticatePost()` */
  static readonly SelfOrderAuthenticatePostPath = '/api/customer/auth';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderAuthenticatePost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  selfOrderAuthenticatePost$Response(params?: SelfOrderAuthenticatePost$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerAuthResponseModelBaseResponseModel>> {
    return selfOrderAuthenticatePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderAuthenticatePost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  selfOrderAuthenticatePost(params?: SelfOrderAuthenticatePost$Params, context?: HttpContext): Observable<CustomerAuthResponseModelBaseResponseModel> {
    return this.selfOrderAuthenticatePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<CustomerAuthResponseModelBaseResponseModel>): CustomerAuthResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderSetNicknamePost()` */
  static readonly SelfOrderSetNicknamePostPath = '/api/customer/nickname';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderSetNicknamePost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  selfOrderSetNicknamePost$Response(params?: SelfOrderSetNicknamePost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return selfOrderSetNicknamePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderSetNicknamePost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  selfOrderSetNicknamePost(params?: SelfOrderSetNicknamePost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.selfOrderSetNicknamePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderGetMenuCategoriesGet()` */
  static readonly SelfOrderGetMenuCategoriesGetPath = '/api/customer/menu/categories';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderGetMenuCategoriesGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetMenuCategoriesGet$Response(params?: SelfOrderGetMenuCategoriesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerMenuCategoriesResponseModelBaseResponseModel>> {
    return selfOrderGetMenuCategoriesGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderGetMenuCategoriesGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetMenuCategoriesGet(params?: SelfOrderGetMenuCategoriesGet$Params, context?: HttpContext): Observable<CustomerMenuCategoriesResponseModelBaseResponseModel> {
    return this.selfOrderGetMenuCategoriesGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<CustomerMenuCategoriesResponseModelBaseResponseModel>): CustomerMenuCategoriesResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderGetMenuItemsGet()` */
  static readonly SelfOrderGetMenuItemsGetPath = '/api/customer/menu/items';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderGetMenuItemsGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetMenuItemsGet$Response(params?: SelfOrderGetMenuItemsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerMenuItemResponseModelListBaseResponseModel>> {
    return selfOrderGetMenuItemsGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderGetMenuItemsGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetMenuItemsGet(params?: SelfOrderGetMenuItemsGet$Params, context?: HttpContext): Observable<CustomerMenuItemResponseModelListBaseResponseModel> {
    return this.selfOrderGetMenuItemsGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<CustomerMenuItemResponseModelListBaseResponseModel>): CustomerMenuItemResponseModelListBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderGetMenuDetailGet()` */
  static readonly SelfOrderGetMenuDetailGetPath = '/api/customer/menu/items/{menuId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderGetMenuDetailGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetMenuDetailGet$Response(params: SelfOrderGetMenuDetailGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerMenuDetailResponseModelBaseResponseModel>> {
    return selfOrderGetMenuDetailGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderGetMenuDetailGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetMenuDetailGet(params: SelfOrderGetMenuDetailGet$Params, context?: HttpContext): Observable<CustomerMenuDetailResponseModelBaseResponseModel> {
    return this.selfOrderGetMenuDetailGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<CustomerMenuDetailResponseModelBaseResponseModel>): CustomerMenuDetailResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderGetOrdersGet()` */
  static readonly SelfOrderGetOrdersGetPath = '/api/customer/orders';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderGetOrdersGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetOrdersGet$Response(params?: SelfOrderGetOrdersGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerOrderTrackingResponseModelBaseResponseModel>> {
    return selfOrderGetOrdersGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderGetOrdersGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetOrdersGet(params?: SelfOrderGetOrdersGet$Params, context?: HttpContext): Observable<CustomerOrderTrackingResponseModelBaseResponseModel> {
    return this.selfOrderGetOrdersGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<CustomerOrderTrackingResponseModelBaseResponseModel>): CustomerOrderTrackingResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderSubmitOrderPost()` */
  static readonly SelfOrderSubmitOrderPostPath = '/api/customer/orders';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderSubmitOrderPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  selfOrderSubmitOrderPost$Response(params?: SelfOrderSubmitOrderPost$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerOrderResponseModelBaseResponseModel>> {
    return selfOrderSubmitOrderPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderSubmitOrderPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  selfOrderSubmitOrderPost(params?: SelfOrderSubmitOrderPost$Params, context?: HttpContext): Observable<CustomerOrderResponseModelBaseResponseModel> {
    return this.selfOrderSubmitOrderPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<CustomerOrderResponseModelBaseResponseModel>): CustomerOrderResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderCallWaiterPost()` */
  static readonly SelfOrderCallWaiterPostPath = '/api/customer/call-waiter';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderCallWaiterPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderCallWaiterPost$Response(params?: SelfOrderCallWaiterPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return selfOrderCallWaiterPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderCallWaiterPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderCallWaiterPost(params?: SelfOrderCallWaiterPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.selfOrderCallWaiterPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderRequestBillPost()` */
  static readonly SelfOrderRequestBillPostPath = '/api/customer/request-bill';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderRequestBillPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderRequestBillPost$Response(params?: SelfOrderRequestBillPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return selfOrderRequestBillPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderRequestBillPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderRequestBillPost(params?: SelfOrderRequestBillPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.selfOrderRequestBillPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderRequestCashPaymentPost()` */
  static readonly SelfOrderRequestCashPaymentPostPath = '/api/customer/request-cash';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderRequestCashPaymentPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderRequestCashPaymentPost$Response(params?: SelfOrderRequestCashPaymentPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return selfOrderRequestCashPaymentPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderRequestCashPaymentPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderRequestCashPaymentPost(params?: SelfOrderRequestCashPaymentPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.selfOrderRequestCashPaymentPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderRequestSplitBillPost()` */
  static readonly SelfOrderRequestSplitBillPostPath = '/api/customer/request-split-bill';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderRequestSplitBillPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  selfOrderRequestSplitBillPost$Response(params?: SelfOrderRequestSplitBillPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return selfOrderRequestSplitBillPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderRequestSplitBillPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  selfOrderRequestSplitBillPost(params?: SelfOrderRequestSplitBillPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.selfOrderRequestSplitBillPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderGetReceiptGet()` */
  static readonly SelfOrderGetReceiptGetPath = '/api/customer/receipt/{orderBillId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderGetReceiptGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetReceiptGet$Response(params: SelfOrderGetReceiptGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReceiptDataModelBaseResponseModel>> {
    return selfOrderGetReceiptGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderGetReceiptGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetReceiptGet(params: SelfOrderGetReceiptGet$Params, context?: HttpContext): Observable<ReceiptDataModelBaseResponseModel> {
    return this.selfOrderGetReceiptGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReceiptDataModelBaseResponseModel>): ReceiptDataModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `selfOrderGetConsolidatedReceiptGet()` */
  static readonly SelfOrderGetConsolidatedReceiptGetPath = '/api/customer/consolidated-receipt';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `selfOrderGetConsolidatedReceiptGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetConsolidatedReceiptGet$Response(params?: SelfOrderGetConsolidatedReceiptGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReceiptDataModelBaseResponseModel>> {
    return selfOrderGetConsolidatedReceiptGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `selfOrderGetConsolidatedReceiptGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  selfOrderGetConsolidatedReceiptGet(params?: SelfOrderGetConsolidatedReceiptGet$Params, context?: HttpContext): Observable<ReceiptDataModelBaseResponseModel> {
    return this.selfOrderGetConsolidatedReceiptGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReceiptDataModelBaseResponseModel>): ReceiptDataModelBaseResponseModel => r.body)
    );
  }

}
