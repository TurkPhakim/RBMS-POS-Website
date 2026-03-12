/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { apiAdminFileFileIdGet } from '../fn/file/api-admin-file-file-id-get';
import { ApiAdminFileFileIdGet$Params } from '../fn/file/api-admin-file-file-id-get';

@Injectable({ providedIn: 'root' })
export class FileService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `apiAdminFileFileIdGet()` */
  static readonly ApiAdminFileFileIdGetPath = '/api/admin/file/{fileId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `apiAdminFileFileIdGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminFileFileIdGet$Response(params: ApiAdminFileFileIdGet$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return apiAdminFileFileIdGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `apiAdminFileFileIdGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  apiAdminFileFileIdGet(params: ApiAdminFileFileIdGet$Params, context?: HttpContext): Observable<void> {
    return this.apiAdminFileFileIdGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
