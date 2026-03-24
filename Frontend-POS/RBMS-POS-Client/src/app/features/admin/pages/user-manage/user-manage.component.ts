import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiConfiguration } from '@app/core/api/api-configuration';
import { UserDetailResponseModel } from '@app/core/api/models';
import { UsersService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';

const KEY_BTN_BACK = 'back';
const KEY_BTN_SAVE = 'save-user';

@Component({
  selector: 'app-user-manage',
  standalone: false,
  templateUrl: './user-manage.component.html',
})
export class UserManageComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  userId = signal<string | null>(null);
  isSaving = signal(false);
  userDetail = signal<UserDetailResponseModel | null>(null);
  serverImageUrl = signal<string | null>(null);
  lastLoginDate = signal<Date | null>(null);
  tomorrow = new Date();
  canUpdate: boolean;

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly formBuilder: FormBuilder,
    private readonly modalService: ModalService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly usersService: UsersService,
  ) {
    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
    this.tomorrow.setHours(0, 0, 0, 0);
    this.canUpdate = this.authService.hasPermission('user-management.update');
  }

  ngOnInit(): void {
    this.initForm();
    this.setupBreadcrumbButtons();

    const id = this.route.snapshot.paramMap.get('userId');
    if (id) {
      this.userId.set(id);
      this.loadUser(id);
    }
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      isActive: [true],
      isLockedByAdmin: [false],
      autoUnlockDate: [null],
    });

    if (!this.canUpdate) {
      this.form.disable();
    }

    this.form
      .get('isLockedByAdmin')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isLocked: boolean) => {
        if (!isLocked) {
          this.form.get('autoUnlockDate')?.setValue(null);
        }
      });
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_BACK,
      type: 'button',
      item: {
        key: KEY_BTN_BACK,
        label: 'ย้อนกลับ',
        severity: 'secondary',
        variant: 'outlined',
        callback: () => this.onCancel(),
      },
    });

    if (this.canUpdate) {
      this.breadcrumbService.addOrUpdateButton({
        key: KEY_BTN_SAVE,
        type: 'button',
        item: {
          key: KEY_BTN_SAVE,
          label: 'บันทึก',
          callback: () => this.onSubmit(),
        },
      });
    }
  }

  private loadUser(userId: string): void {
    this.usersService
      .usersGetUserGet({ userId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const user = response.result;
          if (!user) return;

          this.userDetail.set(user);
          this.lastLoginDate.set(
            user.lastLoginDate ? new Date(user.lastLoginDate) : null,
          );

          if (user.imageFileId) {
            this.serverImageUrl.set(
              `${this.apiConfig.rootUrl}/api/admin/file/${user.imageFileId}`,
            );
          }

          this.form.patchValue({
            isActive: user.isActive,
            isLockedByAdmin: user.isLockedByAdmin,
            autoUnlockDate: user.autoUnlockDate
              ? new Date(user.autoUnlockDate)
              : null,
          }, { emitEvent: false });
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้',
          });
        },
      });
  }

  onSubmit(): void {
    this.isSaving.set(true);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, true);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, true);

    const value = this.form.getRawValue();
    const body = {
      isActive: value.isActive,
      isLockedByAdmin: value.isLockedByAdmin,
      autoUnlockDate: value.isLockedByAdmin && value.autoUnlockDate
        ? value.autoUnlockDate.toISOString()
        : null,
    };

    this.usersService
      .usersUpdateUserSettingsPut({ userId: this.userId()!, body })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.modalService.commonSuccess();
          this.router.navigate(['/admin-setting/users']);
        },
        error: () => {
          this.resetSavingState();
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถบันทึกข้อมูลได้',
          });
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/admin-setting/users']);
  }

  private resetSavingState(): void {
    this.isSaving.set(false);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, false);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, false);
  }
}
