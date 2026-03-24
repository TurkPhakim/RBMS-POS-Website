/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface TablesUnlinkTablesDelete$Params {
  groupCode: string;
}

export function tablesUnlinkTablesDelete(http: HttpClient, rootUrl: string, params: TablesUnlinkTablesDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, tablesUnlinkTablesDelete.PATH, 'delete');
  if (params) {
    rb.path('groupCode', params.groupCode, {});
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

tablesUnlinkTablesDelete.PATH = '/api/table/tables/link/{groupCode}';
