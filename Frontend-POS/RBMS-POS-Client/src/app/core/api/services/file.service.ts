/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { fileDownloadGet } from '../fn/file/file-download-get';
import { FileDownloadGet$Params } from '../fn/file/file-download-get';

@Injectable({ providedIn: 'root' })
export class FileService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `fileDownloadGet()` */
  static readonly FileDownloadGetPath = '/api/admin/file/{fileId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `fileDownloadGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  fileDownloadGet$Response(params: FileDownloadGet$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return fileDownloadGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `fileDownloadGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  fileDownloadGet(params: FileDownloadGet$Params, context?: HttpContext): Observable<void> {
    return this.fileDownloadGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
