/* tslint:disable */
/* eslint-disable */
import { EAddressType } from '../models/e-address-type';
export interface CreateEmployeeAddressRequestModel {
  addressType: EAddressType;
  building?: string | null;
  district?: string | null;
  houseNumber?: string | null;
  moo?: string | null;
  postalCode?: string | null;
  province?: string | null;
  road?: string | null;
  soi?: string | null;
  subDistrict?: string | null;
  yaek?: string | null;
}
