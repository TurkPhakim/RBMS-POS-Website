/* tslint:disable */
/* eslint-disable */
export interface UserDetailResponseModel {
  autoUnlockDate?: string | null;
  createdAt?: string;
  createdByName?: string | null;
  email?: string | null;
  failedLoginAttempts?: number;
  firstNameEnglish?: string | null;
  firstNameThai?: string | null;
  fullNameEnglish?: string | null;
  fullNameThai?: string | null;
  imageFileId?: number | null;
  isActive?: boolean;
  isLockedByAdmin?: boolean;
  lastLoginDate?: string | null;
  lastNameEnglish?: string | null;
  lastNameThai?: string | null;
  lockedUntil?: string | null;
  lockoutCount?: number;
  phone?: string | null;
  positionName?: string | null;
  updatedAt?: string | null;
  updatedByName?: string | null;
  userId?: string;
  username?: string | null;
}
