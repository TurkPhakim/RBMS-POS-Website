/* tslint:disable */
/* eslint-disable */
import { EMenuCategory } from '../models/e-menu-category';
export interface MenuResponseModel {
  category?: EMenuCategory;
  categoryName?: string | null;
  createdAt?: string;
  createdBy?: string | null;
  description?: string | null;
  imageFileId?: number | null;
  imageFileName?: string | null;
  isActive?: boolean;
  isAvailable?: boolean;
  menuId?: number;
  nameEnglish?: string | null;
  nameThai?: string | null;
  price?: number;
  updatedAt?: string | null;
  updatedBy?: string | null;
}
