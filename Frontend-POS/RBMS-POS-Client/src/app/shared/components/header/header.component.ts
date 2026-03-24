import {
  Component,
  computed,
  DestroyRef,
  HostListener,
  Signal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { UserModel } from '@app/core/api/models';
import { AuthService } from '@app/core/services/auth.service';
import { HeaderService } from '@app/core/services/header.service';
import { NotiStoreService } from '@app/core/services/noti-store.service';
import { ShopBrandingService } from '@app/core/services/shop-branding.service';
import { SidebarService } from '@app/core/services/sidebar.service';
import { ChangePasswordDialogComponent } from '@app/shared/dialogs/change-password/change-password-dialog.component';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  providers: [DialogService],
})
export class HeaderComponent {
  currentUser = signal<UserModel | null>(null);
  showProfileMenu = signal(false);
  isSidebarCollapsed: Signal<boolean>;

  profileImageUrl = computed(() => {
    const fileId = this.currentUser()?.profileImageFileId;
    return fileId ? `${this.apiConfig.rootUrl}/api/admin/file/${fileId}` : null;
  });

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    public readonly brandingService: ShopBrandingService,
    private readonly destroyRef: DestroyRef,
    public readonly headerService: HeaderService,
    private readonly dialogService: DialogService,
    public readonly notiStore: NotiStoreService,
    private readonly router: Router,
    private readonly sidebarService: SidebarService,
  ) {
    this.isSidebarCollapsed = toSignal(this.sidebarService.isCollapsed$, {
      initialValue: false,
    });
    this.brandingService.load();
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => this.currentUser.set(user));
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  toggleNotifications(): void {
    this.notiStore.toggleDrawer();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu.update((v) => !v);
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

  openChangePassword(): void {
    this.showProfileMenu.set(false);
    this.dialogService.open(ChangePasswordDialogComponent, {
      header: 'เปลี่ยนรหัสผ่าน',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '40vw',
      modal: true,
    });
  }

  logout(): void {
    this.authService.clearAndRedirectToLogin();
    this.showProfileMenu.set(false);
  }
}
