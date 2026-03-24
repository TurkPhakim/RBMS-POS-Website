import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';

@Injectable()
export class CustomerTokenInterceptor implements HttpInterceptor {

  constructor(
    private customerAuth: CustomerAuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.customerAuth.getToken();

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.customerAuth.clear();
          this.router.navigate(['/expired']);
        }
        return throwError(() => error);
      })
    );
  }
}
