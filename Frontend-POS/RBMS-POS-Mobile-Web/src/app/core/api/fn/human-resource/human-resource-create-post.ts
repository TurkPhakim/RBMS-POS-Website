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
import { EGender } from '../../models/e-gender';
import { EmployeeResponseModelBaseResponseModel } from '../../models/employee-response-model-base-response-model';
import { ENationality } from '../../models/e-nationality';
import { EReligion } from '../../models/e-religion';
import { ETitle } from '../../models/e-title';

export interface HumanResourceCreatePost$Params {
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
'Addresses'?: Array<CreateEmployeeAddressRequestModel>;
'Educations'?: Array<CreateEmployeeEducationRequestModel>;
'WorkHistories'?: Array<CreateEmployeeWorkHistoryRequestModel>;
'imageFile'?: Blob;
}
}

export function humanResourceCreatePost(http: HttpClient, rootUrl: string, params?: HumanResourceCreatePost$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceCreatePost.PATH, 'post');
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

humanResourceCreatePost.PATH = '/api/humanresource';
