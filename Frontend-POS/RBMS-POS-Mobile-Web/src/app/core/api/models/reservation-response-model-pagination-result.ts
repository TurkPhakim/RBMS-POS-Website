/* tslint:disable */
/* eslint-disable */
import { ReservationResponseModel } from '../models/reservation-response-model';
export interface ReservationResponseModelPaginationResult {
  itemPerPage?: number;
  message?: string | null;
  page?: number;
  results?: Array<ReservationResponseModel> | null;
  status?: string | null;
  total?: number;
}
