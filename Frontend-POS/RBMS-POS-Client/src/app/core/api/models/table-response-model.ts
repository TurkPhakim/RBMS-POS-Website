/* tslint:disable */
/* eslint-disable */
import { LinkedTableServingModel } from '../models/linked-table-serving-model';
export interface TableResponseModel {
  capacity?: number;
  createdAt?: string;
  createdBy?: string | null;
  currentGuests?: number | null;
  guestType?: string | null;
  hasQrToken?: boolean;
  isLinkedPrimary?: boolean;
  linkedGroupCode?: string | null;
  linkedTableNames?: Array<string> | null;
  linkedTableServingBreakdown?: Array<LinkedTableServingModel> | null;
  note?: string | null;
  openedAt?: string | null;
  positionX?: number;
  positionY?: number;
  qrShortCode?: string | null;
  size?: string | null;
  status?: string | null;
  tableId?: number;
  tableName?: string | null;
  totalActiveItemCount?: number;
  unservedItemCount?: number;
  updatedAt?: string | null;
  updatedBy?: string | null;
  zoneColor?: string | null;
  zoneId?: number;
  zoneName?: string | null;
}
