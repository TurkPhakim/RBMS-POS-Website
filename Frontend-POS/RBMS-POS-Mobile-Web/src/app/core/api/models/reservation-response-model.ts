/* tslint:disable */
/* eslint-disable */
export interface ReservationResponseModel {
  createdAt?: string;
  createdBy?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  guestCount?: number;
  note?: string | null;
  reminderSent?: boolean;
  reservationDate?: string;
  reservationId?: number;
  reservationTime?: string;
  status?: string | null;
  tableId?: number | null;
  tableName?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}
