/* tslint:disable */
/* eslint-disable */
import { CustomerAuthResponseModel } from '../models/customer-auth-response-model';
export interface CustomerAuthResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: CustomerAuthResponseModel;
  status?: string | null;
}
