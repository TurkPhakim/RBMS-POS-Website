/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateEmployeeEducationRequestModel } from '../../models/create-employee-education-request-model';
import { EmployeeEducationResponseModelBaseResponseModel } from '../../models/employee-education-response-model-base-response-model';

export interface HumanResourceCreateEducationPost$Params {
  employeeId: number;
      body?: CreateEmployeeEducationRequestModel
}

export function humanResourceCreateEducationPost(http: HttpClient, rootUrl: string, params: HumanResourceCreateEducationPost$Params, context?: HttpContext): Observable<StrictHttpResponse<EmployeeEducationResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, humanResourceCreateEducationPost.PATH, 'post');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
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

humanResourceCreateEducationPost.PATH = '/api/humanresource/{employeeId}/educations';
