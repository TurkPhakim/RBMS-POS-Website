/* tslint:disable */
/* eslint-disable */
import { OptionItemRequestModel } from '../models/option-item-request-model';
export interface UpdateOptionGroupRequestModel {
  isActive?: boolean;
  isRequired?: boolean;
  maxSelect?: number | null;
  minSelect?: number;
  name: string;
  optionItems: Array<OptionItemRequestModel>;
}
