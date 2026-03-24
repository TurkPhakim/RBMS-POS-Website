import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';

@Injectable({ providedIn: 'root' })
export class CustomerAuthGuard implements CanActivate {

  constructor(
    private customerAuth: CustomerAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.customerAuth.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/expired']);
    return false;
  }
}
