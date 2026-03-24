/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OrderBillResponseModelBaseResponseModel } from '../../models/order-bill-response-model-base-response-model';
import { UpdateBillChargesRequestModel } from '../../models/update-bill-charges-request-model';

export interface OrdersUpdateBillChargesPut$Params {
  orderBillId: number;
      body?: UpdateBillChargesRequestModel
}

export function ordersUpdateBillChargesPut(http: HttpClient, rootUrl: string, params: OrdersUpdateBillChargesPut$Params, context?: HttpContext): Observable<StrictHttpResponse<OrderBillResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, ordersUpdateBillChargesPut.PATH, 'put');
  if (params) {
    rb.path('orderBillId', params.orderBillId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<OrderBillResponseModelBaseResponseModel>;
    })
  );
}

ordersUpdateBillChargesPut.PATH = '/api/order/orders/bills/{orderBillId}/update-charges';
