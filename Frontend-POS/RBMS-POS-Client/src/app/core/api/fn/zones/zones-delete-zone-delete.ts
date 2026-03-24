/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface ZonesDeleteZoneDelete$Params {
  zoneId: number;
}

export function zonesDeleteZoneDelete(http: HttpClient, rootUrl: string, params: ZonesDeleteZoneDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, zonesDeleteZoneDelete.PATH, 'delete');
  if (params) {
    rb.path('zoneId', params.zoneId, {});
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

zonesDeleteZoneDelete.PATH = '/api/table/zones/{zoneId}';
