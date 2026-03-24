/* tslint:disable */
/* eslint-disable */
export interface UpdateReservationRequestModel {
  customerName: string;
  customerPhone: string;
  guestCount: number;
  note?: string | null;
  reservationDate: string;
  reservationTime: string;
  tableId?: number | null;
}
