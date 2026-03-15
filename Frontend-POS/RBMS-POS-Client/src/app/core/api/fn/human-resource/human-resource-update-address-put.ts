/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmployeeAddressResponseModelBaseResponseModel } from '../../models/employee-address-response-model-base-response-model';
import { UpdateEmployeeAddressRequestModel } from '../../models/update-employee-address-request-model';

export interface HumanResourceUpdateAddressPut$Params {
  employeeId: number;
  addressId: number;
      body?: UpdateEmployeeAddressRequestModel
}

export function humanResourceUpdateAddressPut(http: HttpClient, rootUrl: string, params: HumanResourceUpdateAddressPut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeAddressResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceUpdateAddressPut.PATH, 'put');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
    rb.path('addressId', params.addressId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<EmployeeAddressResponseModelBaseResponseModel>;
    })
  );
}

humanResourceUpdateAddressPut.PATH = '/api/humanresource/{employeeId}/addresses/{addressId}';
