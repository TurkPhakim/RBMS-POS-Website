import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { UserListResponseModel } from '@app/core/api/models';
import { UsersService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit, OnDestroy {
  users = signal<UserListResponseModel[]>([]);
  totalRecords = signal(0);

  searchTerm = '';
  positionFilter: number | null = null;
  statusFilter: string | null = null;
  page = 1;
  rows = 10;

  canUpdate = false;

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly usersService: UsersService,
  ) {}

  ngOnInit(): void {
    this.canUpdate = this.authService.hasPermission('user-management.update');
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  getImageUrl(fileId: number): string {
    return `${this.apiConfig.rootUrl}/api/admin/file/${fileId}`;
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadUsers();
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows)) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadUsers();
  }

  onEdit(userId: string): void {
    this.router.navigate(['/admin-setting/users/update', userId]);
  }

  onResetLoginAttempts(userId: string, fullName: string): void {
    this.modalService
      .info({
        icon: Icon.Question,
        title: 'ยืนยันการปลดล็อค',
        message: `คุณต้องการปลดล็อคบัญชี "${fullName}" และรีเซ็ตจำนวนครั้งที่เข้าสู่ระบบผิดพลาด?`,
        confirmButtonLabel: 'ปลดล็อค',
        cancelButtonLabel: 'ยกเลิก',
        onConfirm: () =>
          this.usersService.usersResetLoginAttemptsPost({ userId }),
      })
      .onClose.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.modalService.commonSuccess();
          this.loadUsers();
        }
      });
  }

  private loadUsers(): void {
    const isActive =
      this.statusFilter === 'active' ? true :
      this.statusFilter === 'inactive' ? false : undefined;
    const isLocked = this.statusFilter === 'locked' ? true : undefined;

    this.usersService
      .usersGetUsersGet({
        Page: this.page,
        ItemPerPage: this.rows,
        Search: this.searchTerm || undefined,
        isActive,
        isLocked,
        positionId: this.positionFilter ?? undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.users.set(response.results ?? []);
          this.totalRecords.set(response.total ?? 0);
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้',
          });
        },
      });
  }
}
