/* tslint:disable */
/* eslint-disable */
export interface CustomerTrackingBillModel {
  billNumber?: string | null;
  billType?: string | null;
  grandTotal?: number;
  orderBillId?: number;
  serviceChargeAmount?: number;
  splitCount?: number;
  splitIndex?: number;
  status?: string | null;
  subTotal?: number;
  totalDiscountAmount?: number;
  vatAmount?: number;
}
