/* tslint:disable */
/* eslint-disable */
import { AddOrderItemOptionModel } from '../models/add-order-item-option-model';
export interface AddOrderItemModel {
  menuId: number;
  note?: string | null;
  options?: Array<AddOrderItemOptionModel> | null;
  quantity: number;
}
