/* tslint:disable */
/* eslint-disable */
import { NotificationResponseModel } from '../models/notification-response-model';
export interface NotificationResponseModelListResponseModel {
  message?: string | null;
  results?: Array<NotificationResponseModel> | null;
  status?: string | null;
  totalItems?: number;
}
