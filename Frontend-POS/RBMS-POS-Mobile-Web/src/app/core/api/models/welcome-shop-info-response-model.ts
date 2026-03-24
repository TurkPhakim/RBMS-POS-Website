/* tslint:disable */
/* eslint-disable */
import { OperatingHourModel } from '../models/operating-hour-model';
export interface WelcomeShopInfoResponseModel {
  description?: string | null;
  foodType?: string | null;
  hasTwoPeriods?: boolean;
  logoFileId?: number | null;
  operatingHours?: Array<OperatingHourModel> | null;
  phoneNumber?: string | null;
  shopNameEnglish?: string | null;
  shopNameThai?: string | null;
}
