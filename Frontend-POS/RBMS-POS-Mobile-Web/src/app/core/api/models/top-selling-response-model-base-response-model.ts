/* tslint:disable */
/* eslint-disable */
import { TopSellingResponseModel } from '../models/top-selling-response-model';
export interface TopSellingResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: TopSellingResponseModel;
  status?: string | null;
}
