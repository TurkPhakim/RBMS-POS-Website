/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface MenuItemsDeleteMenuDelete$Params {
  menuId: number;
}

export function menuItemsDeleteMenuDelete(http: HttpClient, rootUrl: string, params: MenuItemsDeleteMenuDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, menuItemsDeleteMenuDelete.PATH, 'delete');
  if (params) {
    rb.path('menuId', params.menuId, {});
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

menuItemsDeleteMenuDelete.PATH = '/api/menu/items/{menuId}';
