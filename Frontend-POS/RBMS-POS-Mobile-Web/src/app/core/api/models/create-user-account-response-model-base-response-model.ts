/* tslint:disable */
/* eslint-disable */
import { CreateUserAccountResponseModel } from '../models/create-user-account-response-model';
export interface CreateUserAccountResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: CreateUserAccountResponseModel;
  status?: string | null;
}
