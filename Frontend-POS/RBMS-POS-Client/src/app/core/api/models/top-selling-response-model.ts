/* tslint:disable */
/* eslint-disable */
import { TopSellingItemModel } from '../models/top-selling-item-model';
export interface TopSellingResponseModel {
  beverage?: Array<TopSellingItemModel> | null;
  dessert?: Array<TopSellingItemModel> | null;
  food?: Array<TopSellingItemModel> | null;
}
