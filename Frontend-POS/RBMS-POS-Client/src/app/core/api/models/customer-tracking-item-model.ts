/* tslint:disable */
/* eslint-disable */
import { CustomerTrackingOptionModel } from '../models/customer-tracking-option-model';
export interface CustomerTrackingItemModel {
  allergens?: string | null;
  menuImageFileId?: number | null;
  menuName?: string | null;
  note?: string | null;
  options?: Array<CustomerTrackingOptionModel> | null;
  orderItemId?: number;
  orderedBy?: string | null;
  quantity?: number;
  sourceTableName?: string | null;
  status?: string | null;
  totalPrice?: number;
}
