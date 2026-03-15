/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateEmployeeAddressRequestModel } from '../../models/create-employee-address-request-model';
import { EmployeeAddressResponseModelBaseResponseModel } from '../../models/employee-address-response-model-base-response-model';

export interface HumanResourceCreateAddressPost$Params {
  employeeId: number;
      body?: CreateEmployeeAddressRequestModel
}

export function humanResourceCreateAddressPost(http: HttpClient, rootUrl: string, params: HumanResourceCreateAddressPost$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeAddressResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceCreateAddressPost.PATH, 'post');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
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

humanResourceCreateAddressPost.PATH = '/api/humanresource/{employeeId}/addresses';
