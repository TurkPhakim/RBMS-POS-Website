/* tslint:disable */
/* eslint-disable */
export interface SlipUploadResultModel {
  billGrandTotal?: number;
  isAccountMatched?: boolean | null;
  isDateToday?: boolean | null;
  ocrAccountNumber?: string | null;
  ocrAmount?: number | null;
  ocrTransferDate?: string | null;
  orderBillId?: number;
  shopAccountNumber?: string | null;
  slipImageFileId?: number;
  verificationStatus?: string | null;
}
