/* tslint:disable */
/* eslint-disable */
import { CustomerTrackingItemModel } from '../models/customer-tracking-item-model';
export interface CustomerOrderTrackingResponseModel {
  items?: Array<CustomerTrackingItemModel> | null;
  orderId?: number | null;
  orderNumber?: string | null;
  subTotal?: number;
}
