/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { StringBaseResponseModel } from '../models/string-base-response-model';
import { TableResponseModelBaseResponseModel } from '../models/table-response-model-base-response-model';
import { TableResponseModelPaginationResult } from '../models/table-response-model-pagination-result';
import { tablesCleanTablePost } from '../fn/tables/tables-clean-table-post';
import { TablesCleanTablePost$Params } from '../fn/tables/tables-clean-table-post';
import { tablesCloseTablePost } from '../fn/tables/tables-close-table-post';
import { TablesCloseTablePost$Params } from '../fn/tables/tables-close-table-post';
import { tablesCreateTablePost } from '../fn/tables/tables-create-table-post';
import { TablesCreateTablePost$Params } from '../fn/tables/tables-create-table-post';
import { tablesDeleteTableDelete } from '../fn/tables/tables-delete-table-delete';
import { TablesDeleteTableDelete$Params } from '../fn/tables/tables-delete-table-delete';
import { tablesGetQrTokenGet } from '../fn/tables/tables-get-qr-token-get';
import { TablesGetQrTokenGet$Params } from '../fn/tables/tables-get-qr-token-get';
import { tablesGetTableGet } from '../fn/tables/tables-get-table-get';
import { TablesGetTableGet$Params } from '../fn/tables/tables-get-table-get';
import { tablesGetTablesGet } from '../fn/tables/tables-get-tables-get';
import { TablesGetTablesGet$Params } from '../fn/tables/tables-get-tables-get';
import { tablesLinkTablesPost } from '../fn/tables/tables-link-tables-post';
import { TablesLinkTablesPost$Params } from '../fn/tables/tables-link-tables-post';
import { tablesMoveTablePost } from '../fn/tables/tables-move-table-post';
import { TablesMoveTablePost$Params } from '../fn/tables/tables-move-table-post';
import { tablesOpenTablePost } from '../fn/tables/tables-open-table-post';
import { TablesOpenTablePost$Params } from '../fn/tables/tables-open-table-post';
import { tablesSetAvailablePost } from '../fn/tables/tables-set-available-post';
import { TablesSetAvailablePost$Params } from '../fn/tables/tables-set-available-post';
import { tablesSetUnavailablePost } from '../fn/tables/tables-set-unavailable-post';
import { TablesSetUnavailablePost$Params } from '../fn/tables/tables-set-unavailable-post';
import { tablesUnlinkTablesDelete } from '../fn/tables/tables-unlink-tables-delete';
import { TablesUnlinkTablesDelete$Params } from '../fn/tables/tables-unlink-tables-delete';
import { tablesUpdatePositionsPut } from '../fn/tables/tables-update-positions-put';
import { TablesUpdatePositionsPut$Params } from '../fn/tables/tables-update-positions-put';
import { tablesUpdateTablePut } from '../fn/tables/tables-update-table-put';
import { TablesUpdateTablePut$Params } from '../fn/tables/tables-update-table-put';

@Injectable({ providedIn: 'root' })
export class TablesService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `tablesGetTablesGet()` */
  static readonly TablesGetTablesGetPath = '/api/table/tables';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesGetTablesGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesGetTablesGet$Response(params?: TablesGetTablesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelPaginationResult>> {
    return tablesGetTablesGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesGetTablesGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesGetTablesGet(params?: TablesGetTablesGet$Params, context?: HttpContext): Observable<TableResponseModelPaginationResult> {
    return this.tablesGetTablesGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelPaginationResult>): TableResponseModelPaginationResult => r.body)
    );
  }

  /** Path part for operation `tablesCreateTablePost()` */
  static readonly TablesCreateTablePostPath = '/api/table/tables';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesCreateTablePost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesCreateTablePost$Response(params?: TablesCreateTablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
    return tablesCreateTablePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesCreateTablePost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesCreateTablePost(params?: TablesCreateTablePost$Params, context?: HttpContext): Observable<TableResponseModelBaseResponseModel> {
    return this.tablesCreateTablePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelBaseResponseModel>): TableResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `tablesGetTableGet()` */
  static readonly TablesGetTableGetPath = '/api/table/tables/{tableId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesGetTableGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesGetTableGet$Response(params: TablesGetTableGet$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
    return tablesGetTableGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesGetTableGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesGetTableGet(params: TablesGetTableGet$Params, context?: HttpContext): Observable<TableResponseModelBaseResponseModel> {
    return this.tablesGetTableGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelBaseResponseModel>): TableResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `tablesUpdateTablePut()` */
  static readonly TablesUpdateTablePutPath = '/api/table/tables/{tableId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesUpdateTablePut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesUpdateTablePut$Response(params: TablesUpdateTablePut$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
    return tablesUpdateTablePut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesUpdateTablePut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesUpdateTablePut(params: TablesUpdateTablePut$Params, context?: HttpContext): Observable<TableResponseModelBaseResponseModel> {
    return this.tablesUpdateTablePut$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelBaseResponseModel>): TableResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `tablesDeleteTableDelete()` */
  static readonly TablesDeleteTableDeletePath = '/api/table/tables/{tableId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesDeleteTableDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesDeleteTableDelete$Response(params: TablesDeleteTableDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tablesDeleteTableDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesDeleteTableDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesDeleteTableDelete(params: TablesDeleteTableDelete$Params, context?: HttpContext): Observable<void> {
    return this.tablesDeleteTableDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tablesUpdatePositionsPut()` */
  static readonly TablesUpdatePositionsPutPath = '/api/table/tables/positions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesUpdatePositionsPut()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesUpdatePositionsPut$Response(params?: TablesUpdatePositionsPut$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tablesUpdatePositionsPut(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesUpdatePositionsPut$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesUpdatePositionsPut(params?: TablesUpdatePositionsPut$Params, context?: HttpContext): Observable<void> {
    return this.tablesUpdatePositionsPut$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tablesOpenTablePost()` */
  static readonly TablesOpenTablePostPath = '/api/table/tables/{tableId}/open';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesOpenTablePost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesOpenTablePost$Response(params: TablesOpenTablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
    return tablesOpenTablePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesOpenTablePost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesOpenTablePost(params: TablesOpenTablePost$Params, context?: HttpContext): Observable<TableResponseModelBaseResponseModel> {
    return this.tablesOpenTablePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelBaseResponseModel>): TableResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `tablesCloseTablePost()` */
  static readonly TablesCloseTablePostPath = '/api/table/tables/{tableId}/close';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesCloseTablePost()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesCloseTablePost$Response(params: TablesCloseTablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
    return tablesCloseTablePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesCloseTablePost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesCloseTablePost(params: TablesCloseTablePost$Params, context?: HttpContext): Observable<TableResponseModelBaseResponseModel> {
    return this.tablesCloseTablePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelBaseResponseModel>): TableResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `tablesCleanTablePost()` */
  static readonly TablesCleanTablePostPath = '/api/table/tables/{tableId}/clean';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesCleanTablePost()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesCleanTablePost$Response(params: TablesCleanTablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
    return tablesCleanTablePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesCleanTablePost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesCleanTablePost(params: TablesCleanTablePost$Params, context?: HttpContext): Observable<TableResponseModelBaseResponseModel> {
    return this.tablesCleanTablePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelBaseResponseModel>): TableResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `tablesMoveTablePost()` */
  static readonly TablesMoveTablePostPath = '/api/table/tables/{tableId}/move';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesMoveTablePost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesMoveTablePost$Response(params: TablesMoveTablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
    return tablesMoveTablePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesMoveTablePost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesMoveTablePost(params: TablesMoveTablePost$Params, context?: HttpContext): Observable<TableResponseModelBaseResponseModel> {
    return this.tablesMoveTablePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelBaseResponseModel>): TableResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `tablesLinkTablesPost()` */
  static readonly TablesLinkTablesPostPath = '/api/table/tables/link';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesLinkTablesPost()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesLinkTablesPost$Response(params?: TablesLinkTablesPost$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tablesLinkTablesPost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesLinkTablesPost$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  tablesLinkTablesPost(params?: TablesLinkTablesPost$Params, context?: HttpContext): Observable<void> {
    return this.tablesLinkTablesPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tablesUnlinkTablesDelete()` */
  static readonly TablesUnlinkTablesDeletePath = '/api/table/tables/link/{groupCode}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesUnlinkTablesDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesUnlinkTablesDelete$Response(params: TablesUnlinkTablesDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tablesUnlinkTablesDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesUnlinkTablesDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesUnlinkTablesDelete(params: TablesUnlinkTablesDelete$Params, context?: HttpContext): Observable<void> {
    return this.tablesUnlinkTablesDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tablesSetUnavailablePost()` */
  static readonly TablesSetUnavailablePostPath = '/api/table/tables/{tableId}/set-unavailable';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesSetUnavailablePost()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesSetUnavailablePost$Response(params: TablesSetUnavailablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
    return tablesSetUnavailablePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesSetUnavailablePost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesSetUnavailablePost(params: TablesSetUnavailablePost$Params, context?: HttpContext): Observable<TableResponseModelBaseResponseModel> {
    return this.tablesSetUnavailablePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelBaseResponseModel>): TableResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `tablesSetAvailablePost()` */
  static readonly TablesSetAvailablePostPath = '/api/table/tables/{tableId}/set-available';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesSetAvailablePost()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesSetAvailablePost$Response(params: TablesSetAvailablePost$Params, context?: HttpContext): Observable<StrictHttpResponse<TableResponseModelBaseResponseModel>> {
    return tablesSetAvailablePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesSetAvailablePost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesSetAvailablePost(params: TablesSetAvailablePost$Params, context?: HttpContext): Observable<TableResponseModelBaseResponseModel> {
    return this.tablesSetAvailablePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<TableResponseModelBaseResponseModel>): TableResponseModelBaseResponseModel => r.body)
    );
  }

  /** Path part for operation `tablesGetQrTokenGet()` */
  static readonly TablesGetQrTokenGetPath = '/api/table/tables/{tableId}/qr-token';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tablesGetQrTokenGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesGetQrTokenGet$Response(params: TablesGetQrTokenGet$Params, context?: HttpContext): Observable<StrictHttpResponse<StringBaseResponseModel>> {
    return tablesGetQrTokenGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tablesGetQrTokenGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tablesGetQrTokenGet(params: TablesGetQrTokenGet$Params, context?: HttpContext): Observable<StringBaseResponseModel> {
    return this.tablesGetQrTokenGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<StringBaseResponseModel>): StringBaseResponseModel => r.body)
    );
  }

}
