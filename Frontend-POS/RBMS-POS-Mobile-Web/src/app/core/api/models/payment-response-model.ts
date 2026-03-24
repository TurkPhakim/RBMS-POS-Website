/* tslint:disable */
/* eslint-disable */
export interface PaymentResponseModel {
  amountDue?: number;
  amountReceived?: number;
  billNumber?: string | null;
  cashierSessionId?: number;
  changeAmount?: number;
  grandTotal?: number;
  guestCount?: number;
  guestType?: string | null;
  note?: string | null;
  orderBillId?: number;
  orderId?: number;
  orderNumber?: string | null;
  paidAt?: string;
  paymentId?: number;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  slipImageFileId?: number | null;
  slipOcrAmount?: number | null;
  slipVerificationStatus?: string | null;
  tableId?: number | null;
  tableName?: string | null;
  zoneName?: string | null;
}
