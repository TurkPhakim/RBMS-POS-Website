/* tslint:disable */
/* eslint-disable */
import { ShopBrandingResponseModel } from '../models/shop-branding-response-model';
export interface ShopBrandingResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: ShopBrandingResponseModel;
  status?: string | null;
}
