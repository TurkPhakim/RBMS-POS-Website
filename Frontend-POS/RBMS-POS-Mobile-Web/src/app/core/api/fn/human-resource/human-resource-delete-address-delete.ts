/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface HumanResourceDeleteAddressDelete$Params {
  employeeId: number;
  addressId: number;
}

export function humanResourceDeleteAddressDelete(http: HttpClient, rootUrl: string, params: HumanResourceDeleteAddressDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, humanResourceDeleteAddressDelete.PATH, 'delete');
  if (params) {
    rb.path('employeeId', params.employeeId, {});
    rb.path('addressId', params.addressId, {});
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

humanResourceDeleteAddressDelete.PATH = '/api/humanresource/{employeeId}/addresses/{addressId}';
