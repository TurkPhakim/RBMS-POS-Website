import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmployeeResponseModel } from '@app/core/api/models';
import { HumanResourceService } from '@app/core/api/services';
import { ModalService } from '@app/core/services/modal.service';

@Component({
  selector: 'app-create-user-dialog',
  standalone: false,
  templateUrl: './create-user-dialog.component.html',
})
export class CreateUserDialogComponent {
  employee: EmployeeResponseModel;
  imageUrl: string | null;
  isLoading = signal(false);

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly destroyRef: DestroyRef,
    private readonly humanResourceService: HumanResourceService,
    private readonly modalService: ModalService,
  ) {
    this.employee = this.config.data.employee;
    this.imageUrl = this.config.data.imageUrl;
  }

  onConfirm(): void {
    this.isLoading.set(true);

    this.humanResourceService
      .humanResourceCreateUserAccountPost({
        employeeId: this.employee.employeeId!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.ref.close({
            username: response.result?.username ?? '',
            password: response.result?.password ?? '',
          });
        },
        error: () => {
          this.isLoading.set(false);
          this.ref.close();
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถสร้างบัญชีผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
          });
        },
      });
  }

  onCancel(): void {
    this.ref.close();
  }
}
