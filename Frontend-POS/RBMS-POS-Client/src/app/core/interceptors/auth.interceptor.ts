import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isAuthEndpoint = request.url.includes('/api/admin/auth/');

    // Skip interceptor for auth endpoints (no token needed)
    if (isAuthEndpoint) {
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
          this.authService.clearAndRedirectToLogin();
        }

        if (error.status === 403) {
          this.router.navigate(['/access-denied']);
        }

        return throwError(() => error);
      })
    );
  }
}
