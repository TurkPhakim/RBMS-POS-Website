/* tslint:disable */
/* eslint-disable */
export interface TableResponseModel {
  capacity?: number;
  createdAt?: string;
  createdBy?: string | null;
  currentGuests?: number | null;
  guestType?: string | null;
  hasQrToken?: boolean;
  linkedGroupCode?: string | null;
  linkedTableNames?: Array<string> | null;
  note?: string | null;
  openedAt?: string | null;
  positionX?: number;
  positionY?: number;
  size?: string | null;
  status?: string | null;
  tableId?: number;
  tableName?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  zoneColor?: string | null;
  zoneId?: number;
  zoneName?: string | null;
}
