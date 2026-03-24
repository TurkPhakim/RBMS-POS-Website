/* tslint:disable */
/* eslint-disable */
import { CustomerOrderItemResultModel } from '../models/customer-order-item-result-model';
export interface CustomerOrderResponseModel {
  items?: Array<CustomerOrderItemResultModel> | null;
  orderId?: number;
  totalPrice?: number;
}
