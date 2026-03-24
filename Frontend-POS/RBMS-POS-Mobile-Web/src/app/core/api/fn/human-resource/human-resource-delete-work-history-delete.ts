/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface HumanResourceDeleteWorkHistoryDelete$Params {
  employeeId: number;
  workHistoryId: number;
}

export function humanResourceDeleteWorkHistoryDelete(http: HttpClient, rootUrl: string, params: HumanResourceDeleteWorkHistoryDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, humanResourceDeleteWorkHistoryDelete.PATH, 'delete');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
    rb.path('workHistoryId', params.workHistoryId, {});
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

humanResourceDeleteWorkHistoryDelete.PATH = '/api/humanresource/{employeeId}/work-histories/{workHistoryId}';
