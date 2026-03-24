/* tslint:disable */
/* eslint-disable */
import { OptionItemRequestModel } from '../models/option-item-request-model';
export interface CreateOptionGroupRequestModel {
  categoryType: number;
  isActive?: boolean;
  isRequired?: boolean;
  maxSelect?: number | null;
  minSelect?: number;
  name: string;
  optionItems: Array<OptionItemRequestModel>;
}
