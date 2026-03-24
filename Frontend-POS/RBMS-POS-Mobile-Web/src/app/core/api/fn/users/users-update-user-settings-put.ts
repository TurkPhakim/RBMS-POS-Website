/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UpdateUserSettingsRequestModel } from '../../models/update-user-settings-request-model';
import { UserDetailResponseModelBaseResponseModel } from '../../models/user-detail-response-model-base-response-model';

export interface UsersUpdateUserSettingsPut$Params {
  userId: string;
      body?: UpdateUserSettingsRequestModel
}

export function usersUpdateUserSettingsPut(http: HttpClient, rootUrl: string, params: UsersUpdateUserSettingsPut$Params, context?: HttpContext): Observable<StrictHttpResponse<UserDetailResponseModelBaseResponseModel>> {
  const rb = new RequestBuilder(rootUrl, usersUpdateUserSettingsPut.PATH, 'put');
  if (params) {
    rb.path('userId', params.userId, {});
    rb.body(params.body, 'application/*+json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UserDetailResponseModelBaseResponseModel>;
    })
  );
}

usersUpdateUserSettingsPut.PATH = '/api/admin/users/{userId}';
