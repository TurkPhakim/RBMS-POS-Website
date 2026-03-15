/* tslint:disable */
/* eslint-disable */
import { VerifyOtpResponseModel } from '../models/verify-otp-response-model';
export interface VerifyOtpResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: VerifyOtpResponseModel;
  status?: string | null;
}
