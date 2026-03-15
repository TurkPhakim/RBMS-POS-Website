/* tslint:disable */
/* eslint-disable */
import { EDayOfWeek } from '../models/e-day-of-week';
export interface OperatingHourModel {
  closeTime1?: string | null;
  closeTime2?: string | null;
  dayOfWeek?: EDayOfWeek;
  isOpen?: boolean;
  openTime1?: string | null;
  openTime2?: string | null;
  shopOperatingHourId?: number;
}
