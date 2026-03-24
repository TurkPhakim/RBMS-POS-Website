/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface FloorObjectsDeleteFloorObjectDelete$Params {
  floorObjectId: number;
}

export function floorObjectsDeleteFloorObjectDelete(http: HttpClient, rootUrl: string, params: FloorObjectsDeleteFloorObjectDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, floorObjectsDeleteFloorObjectDelete.PATH, 'delete');
  if (params) {
    rb.path('floorObjectId', params.floorObjectId, {});
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

floorObjectsDeleteFloorObjectDelete.PATH = '/api/table/floor-objects/{floorObjectId}';
