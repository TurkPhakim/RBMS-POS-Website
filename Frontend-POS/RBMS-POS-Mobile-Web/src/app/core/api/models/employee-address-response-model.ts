/* tslint:disable */
/* eslint-disable */
import { EAddressType } from '../models/e-address-type';
export interface EmployeeAddressResponseModel {
  addressId?: number;
  addressType?: EAddressType;
  addressTypeName?: string | null;
  building?: string | null;
  district?: string | null;
  employeeId?: number;
  houseNumber?: string | null;
  moo?: string | null;
  postalCode?: string | null;
  province?: string | null;
  road?: string | null;
  soi?: string | null;
  subDistrict?: string | null;
  yaek?: string | null;
}
