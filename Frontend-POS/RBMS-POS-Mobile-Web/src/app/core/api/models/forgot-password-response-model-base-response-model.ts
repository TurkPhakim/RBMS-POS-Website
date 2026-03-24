/* tslint:disable */
/* eslint-disable */
import { ForgotPasswordResponseModel } from '../models/forgot-password-response-model';
export interface ForgotPasswordResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: ForgotPasswordResponseModel;
  status?: string | null;
}
