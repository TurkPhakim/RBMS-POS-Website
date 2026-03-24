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
  serviceChargeRate?: number;
  status?: string | null;
  subTotal?: number;
  totalDiscountAmount?: number;
  vatAmount?: number;
  vatRate?: number;
}
