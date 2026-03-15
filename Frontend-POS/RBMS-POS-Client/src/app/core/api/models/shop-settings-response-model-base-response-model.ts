/* tslint:disable */
/* eslint-disable */
import { ShopSettingsResponseModel } from '../models/shop-settings-response-model';
export interface ShopSettingsResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: ShopSettingsResponseModel;
  status?: string | null;
}
