/* tslint:disable */
/* eslint-disable */
import { CustomerOptionGroupModel } from '../models/customer-option-group-model';
export interface CustomerMenuDetailResponseModel {
  allergens?: string | null;
  description?: string | null;
  imageFileId?: number | null;
  isNew?: boolean;
  isRecommended?: boolean;
  menuId?: number;
  name?: string | null;
  nameEn?: string | null;
  optionGroups?: Array<CustomerOptionGroupModel> | null;
  price?: number;
}
