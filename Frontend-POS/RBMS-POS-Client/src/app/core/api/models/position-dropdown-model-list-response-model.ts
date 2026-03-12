/* tslint:disable */
/* eslint-disable */
import { PositionDropdownModel } from '../models/position-dropdown-model';
export interface PositionDropdownModelListResponseModel {
  message?: string | null;
  results?: Array<PositionDropdownModel> | null;
  status?: string | null;
  totalItems?: number;
}
