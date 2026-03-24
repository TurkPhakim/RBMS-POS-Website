/* tslint:disable */
/* eslint-disable */
export interface ConfirmQrPaymentRequestModel {
  manualAmount?: number | null;
  note?: string | null;
  ocrAmount?: number | null;
  orderBillId: number;
  paymentReference?: string | null;
  slipImageFileId?: number | null;
}
