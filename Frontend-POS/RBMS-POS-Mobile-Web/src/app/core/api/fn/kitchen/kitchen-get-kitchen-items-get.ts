/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { KitchenOrderModelListResponseModel } from '../../models/kitchen-order-model-list-response-model';

export interface KitchenGetKitchenItemsGet$Params {
  categoryType?: number;
  includeReady?: boolean;
}

export function kitchenGetKitchenItemsGet(http: HttpClient, rootUrl: string, params?: KitchenGetKitchenItemsGet$Params, context?: HttpContext): Observable<StrictHttpResponse<KitchenOrderModelListResponseModel>> {
  const rb = new RequestBuilder(rootUrl, kitchenGetKitchenItemsGet.PATH, 'get');
  if (params) {
    rb.query('categoryType', params.categoryType, {});
    rb.query('includeReady', params.includeReady, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<KitchenOrderModelListResponseModel>;
    })
  );
}

kitchenGetKitchenItemsGet.PATH = '/api/kitchen/orders';
