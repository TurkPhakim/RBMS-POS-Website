import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip interceptor for anonymous auth endpoints only (verify-password needs token)
    const anonymousAuthPaths = ['/login', '/refresh-token', '/forgot-password', '/verify-otp', '/reset-password'];
    const isAnonymousAuthEndpoint = request.url.includes('/api/admin/auth/') &&
      anonymousAuthPaths.some(path => request.url.endsWith(path));

    if (isAnonymousAuthEndpoint) {
      return next.handle(request);
    }

    // Get access token from localStorage
    const token = localStorage.getItem('access_token');

    // Add token to request if available
    let authReq = request;
    if (token) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // verify-password ใช้ 401 สำหรับรหัสผ่านผิด — ให้ component จัดการเอง
          const isVerifyPassword = request.url.endsWith('/verify-password');
          if (!isVerifyPassword) {
            this.authService.clearAndRedirectToLogin();
          }
        }

        if (error.status === 403) {
          this.router.navigate(['/access-denied']);
        }

        return throwError(() => error);
      })
    );
  }
}
