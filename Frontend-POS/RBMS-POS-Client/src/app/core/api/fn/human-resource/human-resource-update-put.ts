/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EGender } from '../../models/e-gender';
import { EmployeeResponseModelBaseResponseModel } from '../../models/employee-response-model-base-response-model';
import { ENationality } from '../../models/e-nationality';
import { EReligion } from '../../models/e-religion';
import { ETitle } from '../../models/e-title';

export interface HumanResourceUpdatePut$Params {
  employeeId: number;
      body?: {
'Title': ETitle;
'FirstNameThai': string;
'LastNameThai': string;
'FirstNameEnglish': string;
'LastNameEnglish': string;
'Nickname': string;
'Gender': EGender;
'DateOfBirth': string;
'StartDate': string;
'EndDate'?: string;
'NationalId': string;
'BankAccountNumber'?: string;
'BankName'?: string;
'Nationality': ENationality;
'Religion': EReligion;
'LineId': string;
'PositionId': number;
'Phone': string;
'Email': string;
'IsFullTime'?: boolean;
'Salary'?: number;
'HourlyRate'?: number;
'IsActive'?: boolean;
'UserId'?: string;
'RemoveImage'?: boolean;
'imageFile'?: Blob;
}
}

export function humanResourceUpdatePut(http: HttpClient, rootUrl: string, params: HumanResourceUpdatePut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceUpdatePut.PATH, 'put');
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

humanResourceUpdatePut.PATH = '/api/humanresource/{employeeId}';
