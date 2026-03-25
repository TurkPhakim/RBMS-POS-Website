/* tslint:disable */
/* eslint-disable */
export interface OrderBillResponseModel {
  billNumber?: string | null;
  billType?: string | null;
  createdAt?: string;
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
