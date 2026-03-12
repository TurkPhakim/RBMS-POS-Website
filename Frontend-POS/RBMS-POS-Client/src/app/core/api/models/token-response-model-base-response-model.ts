/* tslint:disable */
/* eslint-disable */
import { TokenResponseModel } from '../models/token-response-model';
export interface TokenResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: TokenResponseModel;
  status?: string | null;
}
