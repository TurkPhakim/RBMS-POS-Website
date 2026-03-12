/* tslint:disable */
/* eslint-disable */
import { EEmploymentStatus } from '../models/e-employment-status';
import { EGender } from '../models/e-gender';
export interface EmployeeResponseModel {
  bankAccountNumber?: string | null;
  bankName?: string | null;
  createdAt?: string;
  createdBy?: string | null;
  dateOfBirth?: string | null;
  email?: string | null;
  employeeId?: number;
  employmentStatus?: EEmploymentStatus;
  employmentStatusName?: string | null;
  endDate?: string | null;
  firstNameEnglish?: string | null;
  firstNameThai?: string | null;
  fullNameEnglish?: string | null;
  fullNameThai?: string | null;
  gender?: EGender;
  genderName?: string | null;
  imageFileId?: number | null;
  imageFileName?: string | null;
  isActive?: boolean;
  lastNameEnglish?: string | null;
  lastNameThai?: string | null;
  nationalId?: string | null;
  nickname?: string | null;
  phone?: string | null;
  positionId?: number | null;
  positionName?: string | null;
  salary?: number | null;
  startDate?: string;
  title?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  userId?: string | null;
  username?: string | null;
}
