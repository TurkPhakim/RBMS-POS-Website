/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { PaymentResponseModelBaseResponseModel } from '../models/payment-response-model-base-response-model';
import { PaymentResponseModelListBaseResponseModel } from '../models/payment-response-model-list-base-response-model';
import { PaymentResponseModelPaginationResult } from '../models/payment-response-model-pagination-result';
import { paymentsConfirmQrPaymentPost } from '../fn/payments/payments-confirm-qr-payment-post';
import { PaymentsConfirmQrPaymentPost$Params } from '../fn/payments/payments-confirm-qr-payment-post';
import { paymentsGetByIdGet } from '../fn/payments/payments-get-by-id-get';
import { PaymentsGetByIdGet$Params } from '../fn/payments/payments-get-by-id-get';
import { paymentsGetByOrderGet } from '../fn/payments/payments-get-by-order-get';
import { PaymentsGetByOrderGet$Params } from '../fn/payments/payments-get-by-order-get';
import { paymentsGetConsolidatedReceiptGet } from '../fn/payments/payments-get-consolidated-receipt-get';
import { PaymentsGetConsolidatedReceiptGet$Params } from '../fn/payments/payments-get-consolidated-receipt-get';
import { paymentsGetHistoryGet } from '../fn/payments/payments-get-history-get';
import { PaymentsGetHistoryGet$Params } from '../fn/payments/payments-get-history-get';
import { paymentsGetReceiptDataGet } from '../fn/payments/payments-get-receipt-data-get';
import { PaymentsGetReceiptDataGet$Params } from '../fn/payments/payments-get-receipt-data-get';
import { paymentsPayCashPost } from '../fn/payments/payments-pay-cash-post';
import { PaymentsPayCashPost$Params } from '../fn/payments/payments-pay-cash-post';
import { paymentsUploadSlipPost } from '../fn/payments/payments-upload-slip-post';
import { PaymentsUploadSlipPost$Params } from '../fn/payments/payments-upload-slip-post';
import { ReceiptDataModelBaseResponseModel } from '../models/receipt-data-model-base-response-model';
import { SlipUploadResultModelBaseResponseModel } from '../models/slip-upload-result-model-base-response-model';

@Injectable({ providedIn: 'root' })
export class PaymentsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `paymentsPayCashPost()` */
  static readonly PaymentsPayCashPostPath = '/api/payment/payments/cash';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paymentsPayCashPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  paymentsPayCashPost$Response(params?: PaymentsPayCashPost$Params, context?: HttpContext): Observable<StrictHttpResponse<PaymentResponseModelBaseResponseModel>> {
    return paymentsPayCashPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paymentsPayCashPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  paymentsPayCashPost(params?: PaymentsPayCashPost$Params, context?: HttpContext): Observable<PaymentResponseModelBaseResponseModel> {
    return this.paymentsPayCashPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<PaymentResponseModelBaseResponseModel>): PaymentResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `paymentsUploadSlipPost()` */
  static readonly PaymentsUploadSlipPostPath = '/api/payment/payments/qr/upload-slip';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paymentsUploadSlipPost()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  paymentsUploadSlipPost$Response(params?: PaymentsUploadSlipPost$Params, context?: HttpContext): Observable<StrictHttpResponse<SlipUploadResultModelBaseResponseModel>> {
    return paymentsUploadSlipPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paymentsUploadSlipPost$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  paymentsUploadSlipPost(params?: PaymentsUploadSlipPost$Params, context?: HttpContext): Observable<SlipUploadResultModelBaseResponseModel> {
    return this.paymentsUploadSlipPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<SlipUploadResultModelBaseResponseModel>): SlipUploadResultModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `paymentsConfirmQrPaymentPost()` */
  static readonly PaymentsConfirmQrPaymentPostPath = '/api/payment/payments/qr/confirm';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paymentsConfirmQrPaymentPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  paymentsConfirmQrPaymentPost$Response(params?: PaymentsConfirmQrPaymentPost$Params, context?: HttpContext): Observable<StrictHttpResponse<PaymentResponseModelBaseResponseModel>> {
    return paymentsConfirmQrPaymentPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paymentsConfirmQrPaymentPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  paymentsConfirmQrPaymentPost(params?: PaymentsConfirmQrPaymentPost$Params, context?: HttpContext): Observable<PaymentResponseModelBaseResponseModel> {
    return this.paymentsConfirmQrPaymentPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<PaymentResponseModelBaseResponseModel>): PaymentResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `paymentsGetByOrderGet()` */
  static readonly PaymentsGetByOrderGetPath = '/api/payment/payments/order/{orderId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paymentsGetByOrderGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetByOrderGet$Response(params: PaymentsGetByOrderGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PaymentResponseModelListBaseResponseModel>> {
    return paymentsGetByOrderGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paymentsGetByOrderGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetByOrderGet(params: PaymentsGetByOrderGet$Params, context?: HttpContext): Observable<PaymentResponseModelListBaseResponseModel> {
    return this.paymentsGetByOrderGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PaymentResponseModelListBaseResponseModel>): PaymentResponseModelListBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `paymentsGetByIdGet()` */
  static readonly PaymentsGetByIdGetPath = '/api/payment/payments/{paymentId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paymentsGetByIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetByIdGet$Response(params: PaymentsGetByIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PaymentResponseModelBaseResponseModel>> {
    return paymentsGetByIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paymentsGetByIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetByIdGet(params: PaymentsGetByIdGet$Params, context?: HttpContext): Observable<PaymentResponseModelBaseResponseModel> {
    return this.paymentsGetByIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PaymentResponseModelBaseResponseModel>): PaymentResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `paymentsGetReceiptDataGet()` */
  static readonly PaymentsGetReceiptDataGetPath = '/api/payment/payments/{paymentId}/receipt';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paymentsGetReceiptDataGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetReceiptDataGet$Response(params: PaymentsGetReceiptDataGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReceiptDataModelBaseResponseModel>> {
    return paymentsGetReceiptDataGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paymentsGetReceiptDataGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetReceiptDataGet(params: PaymentsGetReceiptDataGet$Params, context?: HttpContext): Observable<ReceiptDataModelBaseResponseModel> {
    return this.paymentsGetReceiptDataGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReceiptDataModelBaseResponseModel>): ReceiptDataModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `paymentsGetConsolidatedReceiptGet()` */
  static readonly PaymentsGetConsolidatedReceiptGetPath = '/api/payment/payments/order/{orderId}/consolidated-receipt';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paymentsGetConsolidatedReceiptGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetConsolidatedReceiptGet$Response(params: PaymentsGetConsolidatedReceiptGet$Params, context?: HttpContext): Observable<StrictHttpResponse<ReceiptDataModelBaseResponseModel>> {
    return paymentsGetConsolidatedReceiptGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paymentsGetConsolidatedReceiptGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetConsolidatedReceiptGet(params: PaymentsGetConsolidatedReceiptGet$Params, context?: HttpContext): Observable<ReceiptDataModelBaseResponseModel> {
    return this.paymentsGetConsolidatedReceiptGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReceiptDataModelBaseResponseModel>): ReceiptDataModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `paymentsGetHistoryGet()` */
  static readonly PaymentsGetHistoryGetPath = '/api/payment/payments/history';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paymentsGetHistoryGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetHistoryGet$Response(params?: PaymentsGetHistoryGet$Params, context?: HttpContext): Observable<StrictHttpResponse<PaymentResponseModelPaginationResult>> {
    return paymentsGetHistoryGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paymentsGetHistoryGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  paymentsGetHistoryGet(params?: PaymentsGetHistoryGet$Params, context?: HttpContext): Observable<PaymentResponseModelPaginationResult> {
    return this.paymentsGetHistoryGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<PaymentResponseModelPaginationResult>): PaymentResponseModelPaginationResult => r.body)
    );
  }

}
