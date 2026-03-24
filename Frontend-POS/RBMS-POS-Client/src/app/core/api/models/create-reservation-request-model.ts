/* tslint:disable */
/* eslint-disable */
export interface CreateReservationRequestModel {
  customerName: string;
  customerPhone: string;
  guestCount: number;
  note?: string | null;
  reservationDate: string;
  reservationTime: string;
  tableId?: number | null;
}
