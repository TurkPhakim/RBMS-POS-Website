/* tslint:disable */
/* eslint-disable */
import { LoginResponseModel } from '../models/login-response-model';
export interface LoginResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: LoginResponseModel;
  status?: string | null;
}
