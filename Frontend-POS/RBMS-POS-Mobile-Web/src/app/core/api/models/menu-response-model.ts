/* tslint:disable */
/* eslint-disable */
import { MenuOptionGroupResponseModel } from '../models/menu-option-group-response-model';
export interface MenuResponseModel {
  allergens?: string | null;
  caloriesPerServing?: number | null;
  categoryType?: number;
  categoryTypeName?: string | null;
  costPrice?: number | null;
  createdAt?: string;
  createdBy?: string | null;
  description?: string | null;
  imageFileId?: number | null;
  imageFileName?: string | null;
  isAvailable?: boolean;
  isAvailablePeriod1?: boolean;
  isAvailablePeriod2?: boolean;
  isPinned?: boolean;
  menuId?: number;
  nameEnglish?: string | null;
  nameThai?: string | null;
  optionGroups?: Array<MenuOptionGroupResponseModel> | null;
  price?: number;
  subCategoryId?: number;
  subCategoryName?: string | null;
  tags?: number;
  updatedAt?: string | null;
  updatedBy?: string | null;
}
