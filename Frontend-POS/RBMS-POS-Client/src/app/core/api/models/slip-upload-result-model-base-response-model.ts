/* tslint:disable */
/* eslint-disable */
import { SlipUploadResultModel } from '../models/slip-upload-result-model';
export interface SlipUploadResultModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: SlipUploadResultModel;
  status?: string | null;
}
