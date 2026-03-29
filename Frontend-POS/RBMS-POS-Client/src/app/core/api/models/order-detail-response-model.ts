/* tslint:disable */
/* eslint-disable */
import { OrderItemResponseModel } from '../models/order-item-response-model';
import { OrderLinkedTableModel } from '../models/order-linked-table-model';
export interface OrderDetailResponseModel {
  createdAt?: string;
  guestCount?: number;
  isLinked?: boolean;
  items?: Array<OrderItemResponseModel> | null;
  linkedTables?: Array<OrderLinkedTableModel> | null;
  note?: string | null;
  orderId?: number;
  orderNumber?: string | null;
  primaryTableName?: string | null;
  secondaryTableNames?: Array<string> | null;
  status?: string | null;
  subTotal?: number;
  tableId?: number;
  tableName?: string | null;
  totalGuestCount?: number;
  zoneName?: string | null;
}
