/* tslint:disable */
/* eslint-disable */
import { OptionGroupResponseModel } from '../models/option-group-response-model';
export interface OptionGroupResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: OptionGroupResponseModel;
  status?: string | null;
}
