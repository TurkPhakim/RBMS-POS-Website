/* tslint:disable */
/* eslint-disable */
import { ReceiptItemModel } from '../models/receipt-item-model';
export interface ReceiptDataModel {
  address?: string | null;
  amountReceived?: number;
  billNumber?: string | null;
  cashierName?: string | null;
  changeAmount?: number;
  grandTotal?: number;
  items?: Array<ReceiptItemModel> | null;
  orderNumber?: string | null;
  paidAt?: string;
  paymentId?: number;
  paymentMethod?: string | null;
  phoneNumber?: string | null;
  receiptFooterText?: string | null;
  receiptHeaderText?: string | null;
  serviceChargeAmount?: number;
  serviceChargeRate?: number;
  shopNameEnglish?: string | null;
  shopNameThai?: string | null;
  subTotal?: number;
  tableName?: string | null;
  taxId?: string | null;
  totalDiscountAmount?: number;
  vatAmount?: number;
  vatRate?: number;
}
