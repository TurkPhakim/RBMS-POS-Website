/* tslint:disable */
/* eslint-disable */
import { OrderItemResponseModel } from '../models/order-item-response-model';
export interface OrderDetailResponseModel {
  createdAt?: string;
  guestCount?: number;
  items?: Array<OrderItemResponseModel> | null;
  note?: string | null;
  orderId?: number;
  orderNumber?: string | null;
  status?: string | null;
  subTotal?: number;
  tableId?: number;
  tableName?: string | null;
  zoneName?: string | null;
}
