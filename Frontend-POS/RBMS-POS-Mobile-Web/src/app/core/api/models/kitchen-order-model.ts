/* tslint:disable */
/* eslint-disable */
import { KitchenOrderItemModel } from '../models/kitchen-order-item-model';
export interface KitchenOrderModel {
  items?: Array<KitchenOrderItemModel> | null;
  openedAt?: string | null;
  orderId?: number;
  orderNumber?: string | null;
  tableId?: number;
  tableName?: string | null;
  zoneColor?: string | null;
}
