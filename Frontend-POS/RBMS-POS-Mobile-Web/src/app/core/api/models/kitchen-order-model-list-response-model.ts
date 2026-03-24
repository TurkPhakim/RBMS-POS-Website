/* tslint:disable */
/* eslint-disable */
import { KitchenOrderModel } from '../models/kitchen-order-model';
export interface KitchenOrderModelListResponseModel {
  message?: string | null;
  results?: Array<KitchenOrderModel> | null;
  status?: string | null;
  totalItems?: number;
}
