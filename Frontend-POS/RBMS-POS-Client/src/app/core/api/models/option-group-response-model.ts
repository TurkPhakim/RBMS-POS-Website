/* tslint:disable */
/* eslint-disable */
import { LinkedMenuModel } from '../models/linked-menu-model';
import { OptionItemResponseModel } from '../models/option-item-response-model';
export interface OptionGroupResponseModel {
  categoryType?: number;
  categoryTypeName?: string | null;
  createdAt?: string;
  createdBy?: string | null;
  isActive?: boolean;
  isRequired?: boolean;
  linkedMenuCount?: number;
  linkedMenus?: Array<LinkedMenuModel> | null;
  maxSelect?: number | null;
  minSelect?: number;
  name?: string | null;
  optionGroupId?: number;
  optionItems?: Array<OptionItemResponseModel> | null;
  sortOrder?: number;
  updatedAt?: string | null;
  updatedBy?: string | null;
}
