/* tslint:disable */
/* eslint-disable */
import { MenuOptionItemResponseModel } from '../models/menu-option-item-response-model';
export interface MenuOptionGroupResponseModel {
  isRequired?: boolean;
  maxSelect?: number | null;
  minSelect?: number;
  name?: string | null;
  optionGroupId?: number;
  optionItems?: Array<MenuOptionItemResponseModel> | null;
}
