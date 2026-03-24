/* tslint:disable */
/* eslint-disable */
import { UserDetailResponseModel } from '../models/user-detail-response-model';
export interface UserDetailResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: UserDetailResponseModel;
  status?: string | null;
}
