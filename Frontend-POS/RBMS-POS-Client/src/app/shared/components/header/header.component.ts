import { Component, signal, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '@app/core/services/auth.service';
import { SidebarService } from '@app/core/services/sidebar.service';
import { HeaderService } from '@app/core/services/header.service';
import * as LayoutActions from '@app/store/layout/layout.actions';
import { CurrentUser } from '@app/shared/component-interfaces';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  currentUser: CurrentUser | null = null;
  showProfileMenu = signal(false);

  constructor(
    private store: Store,
    private router: Router,
    private authService: AuthService,
    private sidebarService: SidebarService,
    public headerService: HeaderService
  ) {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch {
        // ignore
      }
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  toggleNotifications(): void {
    this.store.dispatch(LayoutActions.toggleNotificationPanel());
  }

  toggleProfileMenu(): void {
    this.showProfileMenu.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu-container')) {
      this.showProfileMenu.set(false);
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.showProfileMenu.set(false);
  }

  logout(): void {
    this.authService.clearAndRedirectToLogin();
    this.showProfileMenu.set(false);
  }

  getUserInitial(): string {
    return this.currentUser?.username?.charAt(0)?.toUpperCase() || 'U';
  }
}
