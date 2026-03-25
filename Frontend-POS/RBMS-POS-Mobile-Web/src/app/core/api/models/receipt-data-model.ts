/* tslint:disable */
/* eslint-disable */
import { ConsolidatedPaymentInfo } from '../models/consolidated-payment-info';
import { ReceiptItemModel } from '../models/receipt-item-model';
export interface ReceiptDataModel {
  address?: string | null;
  amountReceived?: number;
  billNumber?: string | null;
  billType?: string | null;
  cashierName?: string | null;
  changeAmount?: number;
  grandTotal?: number;
  isConsolidated?: boolean;
  items?: Array<ReceiptItemModel> | null;
  orderNumber?: string | null;
  paidAt?: string;
  paymentId?: number;
  paymentMethod?: string | null;
  payments?: Array<ConsolidatedPaymentInfo> | null;
  phoneNumber?: string | null;
  receiptFooterText?: string | null;
  receiptHeaderText?: string | null;
  serviceChargeAmount?: number;
  serviceChargeRate?: number;
  shopNameEnglish?: string | null;
  shopNameThai?: string | null;
  splitCount?: number;
  splitIndex?: number;
  subTotal?: number;
  tableName?: string | null;
  taxId?: string | null;
  totalDiscountAmount?: number;
  vatAmount?: number;
  vatRate?: number;
}
