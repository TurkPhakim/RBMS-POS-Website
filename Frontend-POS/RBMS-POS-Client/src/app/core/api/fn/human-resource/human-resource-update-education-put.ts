/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmployeeEducationResponseModelBaseResponseModel } from '../../models/employee-education-response-model-base-response-model';
import { UpdateEmployeeEducationRequestModel } from '../../models/update-employee-education-request-model';

export interface HumanResourceUpdateEducationPut$Params {
  employeeId: number;
  educationId: number;
      body?: UpdateEmployeeEducationRequestModel
}

export function humanResourceUpdateEducationPut(http: HttpClient, rootUrl: string, params: HumanResourceUpdateEducationPut$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeEducationResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceUpdateEducationPut.PATH, 'put');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
    rb.path('educationId', params.educationId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<EmployeeEducationResponseModelBaseResponseModel>;
    })
  );
}

humanResourceUpdateEducationPut.PATH = '/api/humanresource/{employeeId}/educations/{educationId}';
