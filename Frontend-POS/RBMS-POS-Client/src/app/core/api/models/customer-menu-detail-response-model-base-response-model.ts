/* tslint:disable */
/* eslint-disable */
import { CustomerMenuDetailResponseModel } from '../models/customer-menu-detail-response-model';
export interface CustomerMenuDetailResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: CustomerMenuDetailResponseModel;
  status?: string | null;
}
