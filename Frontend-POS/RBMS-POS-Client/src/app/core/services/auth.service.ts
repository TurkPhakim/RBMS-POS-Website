import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

import { AuthService as AuthApiService } from '../api/services/auth.service';
import {
  LoginRequestModel,
  LoginResponseModel,
  LoginResponseModelBaseResponseModel,
  RefreshTokenRequestModel,
  UserModel,
} from '../api/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserModel | null>;
  public currentUser$: Observable<UserModel | null>;

  constructor(
    private readonly authApi: AuthApiService,
    private readonly router: Router,
  ) {
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<UserModel | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserModel | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserValue && !!this.getAccessToken();
  }

  public get permissions(): string[] {
    return this.currentUserValue?.permissions ?? this.getPermissionsFromStorage();
  }

  public updateAuthState(): void {
    const user = this.getUserFromStorage();
    this.currentUserSubject.next(user);
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.permissions;
    return permissions.some(p => userPermissions.includes(p));
  }

  login(username: string, password: string, rememberMe = false): Observable<LoginResponseModelBaseResponseModel> {
    const request: LoginRequestModel = { username, password, rememberMe };

    return this.authApi.apiAdminAuthLoginPost({ body: request }).pipe(
      tap((response) => {
        if (response.result) {
          this.handleLoginSuccess(response.result);
        }
      }),
      catchError(this.handleError.bind(this)),
    );
  }

  logout(): Observable<unknown> {
    const refreshToken = this.getRefreshToken();
    const request: RefreshTokenRequestModel = { refreshToken: refreshToken || '' };

    return this.authApi.apiAdminAuthLogoutPost({ body: request }).pipe(
      tap(() => {
        this.clearAuthData();
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
      }),
      catchError((error) => {
        this.clearAuthData();
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      }),
    );
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequestModel = { refreshToken };

    return this.authApi.apiAdminAuthRefreshTokenPost({ body: request }).pipe(
      tap((response) => {
        if (response.result?.accessToken) {
          this.storeAccessToken(response.result.accessToken);
        }
      }),
      map((response) => response.result?.accessToken || ''),
      catchError((error) => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      }),
    );
  }

  clearAndRedirectToLogin(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private storeAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private storeRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  private storeUser(user: UserModel): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private storePermissions(permissions: string[]): void {
    localStorage.setItem('permissions', JSON.stringify(permissions));
  }

  private getPermissionsFromStorage(): string[] {
    const raw = localStorage.getItem('permissions');
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  private getUserFromStorage(): UserModel | null {
    const userJson = localStorage.getItem('current_user');
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as UserModel;
    } catch {
      return null;
    }
  }

  private handleLoginSuccess(data: LoginResponseModel): void {
    if (!data) return;

    if (data.accessToken) this.storeAccessToken(data.accessToken);
    if (data.refreshToken) this.storeRefreshToken(data.refreshToken);

    if (data.user) {
      this.storeUser(data.user);
      this.storePermissions(data.user.permissions ?? []);
      this.currentUserSubject.next(data.user);
      this.router.navigate(['/']);
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('permissions');
  }

  private handleError(error: unknown): Observable<never> {
    let errorMessage = 'An error occurred';
    const err = error as { error?: { error?: { message?: string } }; status?: number };

    if (err.error?.error) {
      errorMessage = err.error.error.message || errorMessage;
    } else if (err.status === 0) {
      errorMessage = 'Cannot connect to server. Please check your connection.';
    } else if (err.status === 401) {
      errorMessage = 'Invalid username or password';
    } else if (err.status === 423) {
      errorMessage = err.error?.error?.message || 'Account is locked';
    } else if (err.status === 403) {
      errorMessage = 'Account is disabled. Contact administrator';
    } else if (err.status && err.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
