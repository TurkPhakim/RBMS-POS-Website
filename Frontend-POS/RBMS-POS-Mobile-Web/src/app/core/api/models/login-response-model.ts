/* tslint:disable */
/* eslint-disable */
import { UserModel } from '../models/user-model';
export interface LoginResponseModel {
  accessToken?: string | null;
  expiresIn?: number;
  refreshToken?: string | null;
  user?: UserModel;
}
