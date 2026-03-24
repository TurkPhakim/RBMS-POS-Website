/* tslint:disable */
/* eslint-disable */
import { CustomerBillSummaryModel } from '../models/customer-bill-summary-model';
import { CustomerOrderItemModel } from '../models/customer-order-item-model';
export interface CustomerBillResponseModel {
  bills?: Array<CustomerBillSummaryModel> | null;
  items?: Array<CustomerOrderItemModel> | null;
  orderNumber?: string | null;
  tableName?: string | null;
}
