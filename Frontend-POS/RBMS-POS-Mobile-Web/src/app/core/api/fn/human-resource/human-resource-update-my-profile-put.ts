/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateEmployeeAddressRequestModel } from '../../models/create-employee-address-request-model';
import { CreateEmployeeEducationRequestModel } from '../../models/create-employee-education-request-model';
import { CreateEmployeeWorkHistoryRequestModel } from '../../models/create-employee-work-history-request-model';
import { EmployeeResponseModelBaseResponseModel } from '../../models/employee-response-model-base-response-model';

export interface HumanResourceUpdateMyProfilePut$Params {
      body?: {
'Username'?: string;
'LineId'?: string;
'BankName'?: string;
'BankAccountNumber'?: string;
'EndDate'?: string;
'Phone'?: string;
'RemoveImage'?: boolean;
'Addresses'?: Array<CreateEmployeeAddressRequestModel>;
'Educations'?: Array<CreateEmployeeEducationRequestModel>;
'WorkHistories'?: Array<CreateEmployeeWorkHistoryRequestModel>;
'imageFile'?: Blob;
}
}

export function humanResourceUpdateMyProfilePut(http: HttpClient, rootUrl: string, params?: HumanResourceUpdateMyProfilePut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceUpdateMyProfilePut.PATH, 'put');
  if (params) {
    rb.body(params.body, 'multipart/form-data');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<EmployeeResponseModelBaseResponseModel>;
    })
  );
}

humanResourceUpdateMyProfilePut.PATH = '/api/humanresource/me/profile';
