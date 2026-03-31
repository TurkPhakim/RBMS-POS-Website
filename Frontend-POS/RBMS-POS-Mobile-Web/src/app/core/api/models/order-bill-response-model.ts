/* tslint:disable */
/* eslint-disable */
export interface OrderBillResponseModel {
  billNumber?: string | null;
  billType?: string | null;
  createdAt?: string;
  customerSlipFileId?: number | null;
  customerSlipIsAccountMatched?: boolean | null;
  customerSlipIsDateToday?: boolean | null;
  customerSlipOcrAccountNumber?: string | null;
  customerSlipOcrAmount?: number | null;
  customerSlipOcrTransferDate?: string | null;
  customerSlipVerificationStatus?: string | null;
  grandTotal?: number;
  netAmount?: number;
  orderBillId?: number;
  orderId?: number;
  paidAt?: string | null;
  serviceChargeAmount?: number;
  serviceChargeId?: number | null;
  serviceChargeRate?: number;
  splitCount?: number;
  splitIndex?: number;
  status?: string | null;
  subTotal?: number;
  totalDiscountAmount?: number;
  vatAmount?: number;
  vatRate?: number;
}
