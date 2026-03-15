/* tslint:disable */
/* eslint-disable */
import { MyProfileResponseModel } from '../models/my-profile-response-model';
export interface MyProfileResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: MyProfileResponseModel;
  status?: string | null;
}
