import { Injectable } from '@angular/core';
import { CustomerAuthResponseModel } from '@core/api/models/customer-auth-response-model';

const TOKEN_KEY = 'customer_token';
const SESSION_KEY = 'customer_session';
const QR_TOKEN_KEY = 'customer_qr_token';

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {

  saveSession(data: {
    token: string;
    qrToken?: string;
  } & CustomerAuthResponseModel): void {
    localStorage.setItem(TOKEN_KEY, data.token);
    const session: CustomerAuthResponseModel = {
      tableId: data.tableId,
      tableName: data.tableName,
      zoneName: data.zoneName,
      nickname: data.nickname,
      shopNameThai: data.shopNameThai,
      shopNameEnglish: data.shopNameEnglish,
      logoFileId: data.logoFileId,
      address: data.address,
      phoneNumber: data.phoneNumber,
      shopEmail: data.shopEmail,
      facebook: data.facebook,
      instagram: data.instagram,
      website: data.website,
      paymentQrCodeFileId: data.paymentQrCodeFileId,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      wifiSsid: data.wifiSsid,
      wifiPassword: data.wifiPassword,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (data.qrToken) localStorage.setItem(QR_TOKEN_KEY, data.qrToken);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getQrToken(): string | null {
    return localStorage.getItem(QR_TOKEN_KEY);
  }

  getSession(): CustomerAuthResponseModel | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CustomerAuthResponseModel;
  }

  updateNickname(nickname: string): void {
    const session = this.getSession();
    if (session) {
      session.nickname = nickname;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  getTokenExpiryMs(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const exp = this.decodeTokenExp(token);
    if (exp === null) return null;
    return (exp * 1000) - Date.now();
  }

  private isTokenExpired(token: string): boolean {
    const exp = this.decodeTokenExp(token);
    if (exp === null) return true;
    return Date.now() >= exp * 1000;
  }

  private decodeTokenExp(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.exp ?? null;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(QR_TOKEN_KEY);
  }
}
