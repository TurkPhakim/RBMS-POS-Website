/* tslint:disable */
/* eslint-disable */
import { CustomerCategoryModel } from '../models/customer-category-model';
import { CustomerSubCategoryModel } from '../models/customer-sub-category-model';
export interface CustomerMenuCategoriesResponseModel {
  categories?: Array<CustomerCategoryModel> | null;
  subCategories?: Array<CustomerSubCategoryModel> | null;
}
