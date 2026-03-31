/* tslint:disable */
/* eslint-disable */
export interface CustomerBillSummaryModel {
  billNumber?: string | null;
  billType?: string | null;
  claimPaymentMethod?: string | null;
  claimedByNickname?: string | null;
  grandTotal?: number;
  isClaimedByMe?: boolean;
  orderBillId?: number;
  serviceChargeAmount?: number;
  splitCount?: number;
  splitIndex?: number;
  status?: string | null;
  subTotal?: number;
  totalDiscountAmount?: number;
  vatAmount?: number;
}
