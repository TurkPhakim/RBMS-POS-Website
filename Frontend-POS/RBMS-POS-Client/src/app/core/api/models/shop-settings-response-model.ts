/* tslint:disable */
/* eslint-disable */
import { OperatingHourModel } from '../models/operating-hour-model';
export interface ShopSettingsResponseModel {
  address?: string | null;
  companyNameEnglish?: string | null;
  companyNameThai?: string | null;
  createdAt?: string;
  createdByName?: string | null;
  description?: string | null;
  facebook?: string | null;
  foodType?: string | null;
  hasTwoPeriods?: boolean;
  instagram?: string | null;
  lineId?: string | null;
  logoFileId?: number | null;
  logoFileName?: string | null;
  operatingHours?: Array<OperatingHourModel> | null;
  paymentQrCodeFileId?: number | null;
  paymentQrCodeFileName?: string | null;
  phoneNumber?: string | null;
  shopEmail?: string | null;
  shopNameEnglish?: string | null;
  shopNameThai?: string | null;
  shopSettingsId?: number;
  taxId?: string | null;
  updatedAt?: string | null;
  updatedByName?: string | null;
  website?: string | null;
}
