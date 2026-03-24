/* tslint:disable */
/* eslint-disable */
import { ReservationResponseModel } from '../models/reservation-response-model';
export interface ReservationResponseModelBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: ReservationResponseModel;
  status?: string | null;
}
