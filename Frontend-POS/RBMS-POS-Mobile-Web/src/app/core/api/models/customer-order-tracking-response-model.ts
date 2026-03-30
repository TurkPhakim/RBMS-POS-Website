/* tslint:disable */
/* eslint-disable */
import { CustomerTrackingBillModel } from '../models/customer-tracking-bill-model';
import { CustomerTrackingItemModel } from '../models/customer-tracking-item-model';
export interface CustomerOrderTrackingResponseModel {
  bills?: Array<CustomerTrackingBillModel> | null;
  items?: Array<CustomerTrackingItemModel> | null;
  orderId?: number | null;
  orderNumber?: string | null;
  orderStatus?: string | null;
  subTotal?: number;
}
