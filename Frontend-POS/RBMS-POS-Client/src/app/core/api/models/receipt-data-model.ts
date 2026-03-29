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
  companyNameEnglish?: string | null;
  companyNameThai?: string | null;
  facebook?: string | null;
  grandTotal?: number;
  guestCount?: number;
  instagram?: string | null;
  isConsolidated?: boolean;
  items?: Array<ReceiptItemModel> | null;
  lineId?: string | null;
  orderNumber?: string | null;
  originalSubTotal?: number;
  paidAt?: string;
  paymentId?: number;
  paymentMethod?: string | null;
  payments?: Array<ConsolidatedPaymentInfo> | null;
  phoneNumber?: string | null;
  receiptFooterText?: string | null;
  receiptHeaderText?: string | null;
  serviceChargeAmount?: number;
  serviceChargeRate?: number;
  shopEmail?: string | null;
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
  website?: string | null;
  zoneName?: string | null;
}
