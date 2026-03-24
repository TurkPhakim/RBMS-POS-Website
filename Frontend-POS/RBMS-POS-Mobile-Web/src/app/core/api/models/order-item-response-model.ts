/* tslint:disable */
/* eslint-disable */
import { OrderItemOptionResponseModel } from '../models/order-item-option-response-model';
export interface OrderItemResponseModel {
  cancelReason?: string | null;
  cancelledByName?: string | null;
  categoryType?: number;
  cookingStartedAt?: string | null;
  menuId?: number;
  menuImageFileId?: number | null;
  menuNameEnglish?: string | null;
  menuNameThai?: string | null;
  note?: string | null;
  options?: Array<OrderItemOptionResponseModel> | null;
  optionsTotalPrice?: number;
  orderItemId?: number;
  orderedBy?: string | null;
  quantity?: number;
  readyAt?: string | null;
  sentToKitchenAt?: string | null;
  servedAt?: string | null;
  status?: string | null;
  subCategoryName?: string | null;
  totalPrice?: number;
  unitPrice?: number;
}
