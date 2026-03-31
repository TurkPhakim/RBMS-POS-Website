/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { CustomerBillResponseModelBaseResponseModel } from '../models/customer-bill-response-model-base-response-model';
import { customerClaimBillPost } from '../fn/customer/customer-claim-bill-post';
import { CustomerClaimBillPost$Params } from '../fn/customer/customer-claim-bill-post';
import { customerGetBillGet } from '../fn/customer/customer-get-bill-get';
import { CustomerGetBillGet$Params } from '../fn/customer/customer-get-bill-get';
import { customerGetPaymentStatusGet } from '../fn/customer/customer-get-payment-status-get';
import { CustomerGetPaymentStatusGet$Params } from '../fn/customer/customer-get-payment-status-get';
import { customerReleaseBillPost } from '../fn/customer/customer-release-bill-post';
import { CustomerReleaseBillPost$Params } from '../fn/customer/customer-release-bill-post';
import { customerUploadSlipPost } from '../fn/customer/customer-upload-slip-post';
import { CustomerUploadSlipPost$Params } from '../fn/customer/customer-upload-slip-post';
import { ObjectBaseResponseModel } from '../models/object-base-response-model';
import { SlipUploadResultModelBaseResponseModel } from '../models/slip-upload-result-model-base-response-model';
import { StringBaseResponseModel } from '../models/string-base-response-model';

@Injectable({ providedIn: 'root' })
export class CustomerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `customerGetBillGet()` */
  static readonly CustomerGetBillGetPath = '/api/customer/{qrToken}/bill';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `customerGetBillGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  customerGetBillGet$Response(params: CustomerGetBillGet$Params, context?: HttpContext): Observable<StrictHttpResponse<CustomerBillResponseModelBaseResponseModel>> {
    return customerGetBillGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `customerGetBillGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  customerGetBillGet(params: CustomerGetBillGet$Params, context?: HttpContext): Observable<CustomerBillResponseModelBaseResponseModel> {
    return this.customerGetBillGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<CustomerBillResponseModelBaseResponseModel>): CustomerBillResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `customerClaimBillPost()` */
  static readonly CustomerClaimBillPostPath = '/api/customer/{qrToken}/bills/{orderBillId}/claim';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `customerClaimBillPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  customerClaimBillPost$Response(params: CustomerClaimBillPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return customerClaimBillPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `customerClaimBillPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  customerClaimBillPost(params: CustomerClaimBillPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.customerClaimBillPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `customerReleaseBillPost()` */
  static readonly CustomerReleaseBillPostPath = '/api/customer/{qrToken}/bills/{orderBillId}/release';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `customerReleaseBillPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  customerReleaseBillPost$Response(params: CustomerReleaseBillPost$Params, context?: HttpContext): Observable<StrictHttpResponse<ObjectBaseResponseModel>> {
    return customerReleaseBillPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `customerReleaseBillPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  customerReleaseBillPost(params: CustomerReleaseBillPost$Params, context?: HttpContext): Observable<ObjectBaseResponseModel> {
    return this.customerReleaseBillPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<ObjectBaseResponseModel>): ObjectBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `customerUploadSlipPost()` */
  static readonly CustomerUploadSlipPostPath = '/api/customer/{qrToken}/upload-slip';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `customerUploadSlipPost()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  customerUploadSlipPost$Response(params: CustomerUploadSlipPost$Params, context?: HttpContext): Observable<StrictHttpResponse<SlipUploadResultModelBaseResponseModel>> {
    return customerUploadSlipPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `customerUploadSlipPost$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  customerUploadSlipPost(params: CustomerUploadSlipPost$Params, context?: HttpContext): Observable<SlipUploadResultModelBaseResponseModel> {
    return this.customerUploadSlipPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<SlipUploadResultModelBaseResponseModel>): SlipUploadResultModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `customerGetPaymentStatusGet()` */
  static readonly CustomerGetPaymentStatusGetPath = '/api/customer/{qrToken}/bill/{orderBillId}/status';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `customerGetPaymentStatusGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  customerGetPaymentStatusGet$Response(params: CustomerGetPaymentStatusGet$Params, context?: HttpContext): Observable<StrictHttpResponse<StringBaseResponseModel>> {
    return customerGetPaymentStatusGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `customerGetPaymentStatusGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  customerGetPaymentStatusGet(params: CustomerGetPaymentStatusGet$Params, context?: HttpContext): Observable<StringBaseResponseModel> {
    return this.customerGetPaymentStatusGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<StringBaseResponseModel>): StringBaseResponseModel => r.body)
    );
  }

}
