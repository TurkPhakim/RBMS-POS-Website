/* tslint:disable */
/* eslint-disable */
import { TableResponseModel } from '../models/table-response-model';
export interface TableResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: TableResponseModel;
  status?: string | null;
}
