/* tslint:disable */
/* eslint-disable */
import { WelcomeShopInfoResponseModel } from '../models/welcome-shop-info-response-model';
export interface WelcomeShopInfoResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: WelcomeShopInfoResponseModel;
  status?: string | null;
}
