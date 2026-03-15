import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    if (!this.authService.isAuthenticated) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    const requiredPermissions = route.data['permissions'] as string[] | undefined;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    if (this.authService.hasAnyPermission(requiredPermissions)) {
      return true;
    }

    return this.router.createUrlTree(['/access-denied']);
  }
}
