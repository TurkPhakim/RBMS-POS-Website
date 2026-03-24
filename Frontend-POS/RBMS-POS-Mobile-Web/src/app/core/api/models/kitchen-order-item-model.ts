/* tslint:disable */
/* eslint-disable */
import { KitchenOptionModel } from '../models/kitchen-option-model';
export interface KitchenOrderItemModel {
  cancelReason?: string | null;
  categoryType?: number;
  cookingStartedAt?: string | null;
  menuId?: number;
  menuNameEnglish?: string | null;
  menuNameThai?: string | null;
  note?: string | null;
  options?: Array<KitchenOptionModel> | null;
  orderItemId?: number;
  quantity?: number;
  readyAt?: string | null;
  sentToKitchenAt?: string | null;
  status?: string | null;
}
