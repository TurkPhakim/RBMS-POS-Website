/* tslint:disable */
/* eslint-disable */
import { CashDrawerTransactionResponseModel } from '../models/cash-drawer-transaction-response-model';
import { PaymentResponseModel } from '../models/payment-response-model';
export interface CashierSessionResponseModel {
  actualCash?: number | null;
  billCount?: number;
  cashDrawerTransactions?: Array<CashDrawerTransactionResponseModel> | null;
  cashierSessionId?: number;
  closedAt?: string | null;
  createdAt?: string;
  expectedCash?: number;
  fullNameThai?: string | null;
  imageFileId?: number | null;
  openedAt?: string;
  openingCash?: number;
  payments?: Array<PaymentResponseModel> | null;
  positionName?: string | null;
  shiftPeriod?: number | null;
  status?: string | null;
  totalCashSales?: number;
  totalQrSales?: number;
  totalSales?: number;
  updatedAt?: string | null;
  userId?: string;
  userName?: string | null;
  variance?: number | null;
}
