/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { OperatingHourModel } from '../../models/operating-hour-model';
import { ShopSettingsResponseModelBaseResponseModel } from '../../models/shop-settings-response-model-base-response-model';

export interface ShopSettingsUpdatePut$Params {
      body?: {
'ShopNameThai': string;
'ShopNameEnglish': string;
'CompanyNameThai'?: string;
'CompanyNameEnglish'?: string;
'TaxId': string;
'FoodType': string;
'Description'?: string;
'HasTwoPeriods'?: boolean;
'Address': string;
'PhoneNumber': string;
'ShopEmail'?: string;
'Facebook'?: string;
'Instagram'?: string;
'Website'?: string;
'LineId'?: string;
'ReceiptHeaderText'?: string;
'ReceiptFooterText'?: string;
'BankName'?: string;
'AccountNumber'?: string;
'AccountName'?: string;
'WifiSsid'?: string;
'WifiPassword'?: string;
'OperatingHours'?: Array<OperatingHourModel>;
'RemoveLogo'?: boolean;
'RemoveQrCode'?: boolean;
'logoFile'?: Blob;
'paymentQrCodeFile'?: Blob;
}
}

export function shopSettingsUpdatePut(http: HttpClient, rootUrl: string, params?: ShopSettingsUpdatePut$Params, context?: HttpContext): Observable<StrictHttpResponse<ShopSettingsResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, shopSettingsUpdatePut.PATH, 'put');
  if (params) {
    rb.body(params.body, 'multipart/form-data');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ShopSettingsResponseModelBaseResponseModel>;
    })
  );
}

shopSettingsUpdatePut.PATH = '/api/admin/shop-settings';
