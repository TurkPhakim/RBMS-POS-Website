/* tslint:disable */
/* eslint-disable */
import { UserListResponseModel } from '../models/user-list-response-model';
export interface UserListResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<UserListResponseModel> | null;
  status?: string | null;
  total?: number;
}
