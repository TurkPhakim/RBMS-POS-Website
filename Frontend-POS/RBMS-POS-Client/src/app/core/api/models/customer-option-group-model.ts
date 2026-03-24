/* tslint:disable */
/* eslint-disable */
import { CustomerOptionItemModel } from '../models/customer-option-item-model';
export interface CustomerOptionGroupModel {
  isRequired?: boolean;
  items?: Array<CustomerOptionItemModel> | null;
  maxSelections?: number;
  name?: string | null;
  optionGroupId?: number;
}
