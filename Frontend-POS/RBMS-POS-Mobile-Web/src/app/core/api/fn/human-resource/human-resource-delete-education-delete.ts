/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface HumanResourceDeleteEducationDelete$Params {
  employeeId: number;
  educationId: number;
}

export function humanResourceDeleteEducationDelete(http: HttpClient, rootUrl: string, params: HumanResourceDeleteEducationDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, humanResourceDeleteEducationDelete.PATH, 'delete');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
    rb.path('educationId', params.educationId, {});
  }

  return http.request(
    rb.build({ responseType: 'text', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
    })
  );
}

humanResourceDeleteEducationDelete.PATH = '/api/humanresource/{employeeId}/educations/{educationId}';
