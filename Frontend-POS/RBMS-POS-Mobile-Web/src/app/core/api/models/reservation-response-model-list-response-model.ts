/* tslint:disable */
/* eslint-disable */
import { ReservationResponseModel } from '../models/reservation-response-model';
export interface ReservationResponseModelListResponseModel {
  message?: string | null;
  results?: Array<ReservationResponseModel> | null;
  status?: string | null;
  totalItems?: number;
}
