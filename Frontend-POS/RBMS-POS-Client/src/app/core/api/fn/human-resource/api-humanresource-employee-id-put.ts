/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EEmploymentStatus } from '../../models/e-employment-status';
import { EGender } from '../../models/e-gender';
import { EmployeeResponseModelBaseResponseModel } from '../../models/employee-response-model-base-response-model';

export interface ApiHumanresourceEmployeeIdPut$Params {
  employeeId: number;
      body?: {
'Title'?: string;
'FirstNameThai': string;
'LastNameThai': string;
'FirstNameEnglish': string;
'LastNameEnglish': string;
'Nickname'?: string;
'Gender': EGender;
'DateOfBirth'?: string;
'StartDate': string;
'EndDate'?: string;
'NationalId'?: string;
'BankAccountNumber'?: string;
'BankName'?: string;
'EmploymentStatus': EEmploymentStatus;
'PositionId'?: number;
'Phone'?: string;
'Email'?: string;
'Salary'?: number;
'IsActive'?: boolean;
'UserId'?: string;
'imageFile'?: Blob;
}
}

export function apiHumanresourceEmployeeIdPut(http: HttpClient, rootUrl: string, params: ApiHumanresourceEmployeeIdPut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, apiHumanresourceEmployeeIdPut.PATH, 'put');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
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

apiHumanresourceEmployeeIdPut.PATH = '/api/humanresource/{employeeId}';
